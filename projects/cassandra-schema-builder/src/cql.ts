import { Columns, ColumnType, Collection, ClusteringOrder, ClusteringOrderIndexed, ClusteringOrderSorting } from './table';

export namespace CQLErrors {
	export class InvalidTableSchema extends Error {
		constructor(
			erroMessage: string,
			public readonly tableName: string,
			public readonly tableSchema: Columns,
		) {
			super(`Cannot create table ${tableName} due to invalid schema: ${erroMessage}`);
		}
	}
}

export namespace CQL {
	export const createKeyspace = (keyspaceName: string, replicationFactor: number = 1) => {
		const cql = `
			CREATE KEYSPACE IF NOT EXISTS ${keyspaceName}
			WITH REPLICATION = { 
				'class' : 'SimpleStrategy', 
				'replication_factor' : ${replicationFactor} 
			};
		`;

		return cql;
	}

	export const dropKeyspace = (keyspaceName: string) => {
		const cql = `DROP KEYSPACE IF EXISTS ${keyspaceName}`;

		return cql;
	}

	const sortClusteringColumns = (entries: [string, ClusteringOrder][]): [string, ClusteringOrderIndexed][] => {
		const isEntryWithIndex = (entry: [string, ClusteringOrder]): entry is [string, ClusteringOrderIndexed] =>
			typeof entry[1] === 'object' && entry[1].index !== undefined && entry[1].order !== undefined;
		const isEntryWithoutIndex = (entry: [string, ClusteringOrder]): entry is [string, ClusteringOrderSorting] =>
			typeof entry[1] === 'string';

		const entriesWithIndex = entries.filter(isEntryWithIndex);
		const entriesWithoutIndex = entries.filter(isEntryWithoutIndex);

		const entriesWithIndexSorted = entriesWithIndex.sort((lhs, rhs) => lhs[1].index - rhs[1].index);

		return entriesWithIndexSorted.concat(entriesWithoutIndex
			.map((entry): [string, ClusteringOrderIndexed] => [entry[0], { index: Number.MAX_SAFE_INTEGER, order: entry[1] }]));
	}

	const sortClusteringKeys = (keys: string[], clusteringColumns: [string, ClusteringOrderIndexed][]) => {
		const clusteringColumnKeys = new Set(clusteringColumns.map(entry => entry[0]));

		return keys.sort((lhsKey, rhsKey) => {
			let lhsPriority = Number.MAX_SAFE_INTEGER;
			let rhsPriority = Number.MAX_SAFE_INTEGER;

			if (clusteringColumnKeys.has(lhsKey)) {
				lhsPriority = clusteringColumns.find(entry => entry[0] === lhsKey)![1].index;
			}

			if (clusteringColumnKeys.has(rhsKey)) {
				rhsPriority = clusteringColumns.find(entry => entry[0] === rhsKey)![1].index;
			}

			return lhsPriority - rhsPriority;
		});
	}

	export const createTable = (tableName: string, schema: Columns) => {
		const partititionKeys = Object.entries(schema)
			.filter(([_, value]) => value.partitionKey === true)
			.map(([key, _]) => key);
		const clusteringColumns = sortClusteringColumns(
			Object.entries(schema)
				.filter(([_, value]) => value.clusteringKey === true && value.clusteringOrder !== undefined)
				.map(([key, value]): [string, ClusteringOrder] => [key, value.clusteringOrder!])
		);
		const clusteringKeys = sortClusteringKeys(
			Object.entries(schema)
				.filter(([_, value]) => value.clusteringKey === true)
				.map(([key, _]) => key),
			clusteringColumns
		);

		if (partititionKeys.length === 0) {
			throw new CQLErrors.InvalidTableSchema('No primary key defined', tableName, schema);
		}

		const primaryKey = `(${partititionKeys.join(',')})${clusteringKeys.length ? `, ${clusteringKeys.join(', ')}` : ''}`;
		const clusteringOrder = clusteringColumns.length ? ` WITH CLUSTERING ORDER BY (${clusteringColumns.map(col => `${col[0]} ${col[1].order.toString().toUpperCase()}`).join(', ')})` : '';

		const cql = [
			`CREATE TABLE ${tableName} (`,
			Object.entries(schema).map(([columnName, columnDef]) =>
				`	${columnName} ${mapColumnType(columnDef.type)},`).join('\n'),
			`	`,
			`	PRIMARY KEY(${primaryKey})`,
			`)${clusteringOrder};`
		];

		return cql.join('\n');
	}

	const mapColumnType = (type: ColumnType | Collection<ColumnType>): string => {
		if (typeof type === 'string') {
			return type;
		} else {
			return mapCollectionType(type);
		}
	}

	const mapCollectionType = <T extends ColumnType>(column: Collection<T>): string =>
		`${column.collection}<${column.type}>`;

	export const insert = (tableName: string, subset: string[]) => {
		const cql = `INSERT INTO ${tableName}`
			+ ` ( ${subset.join(", ")} )`
			+ ` VALUES ( ${subset.map(() => `?`).join(', ')} );`;

		return cql;
	}

	export const update = (tableName: string, subset: string[], where: string[]) => {
		const cql = `UPDATE ${tableName} `
			+ `SET ${subset.map(col => `${col} = ?`).join(', ')} `
			+ `WHERE ${where.map(col => `${col} = ?`).join(' AND ')};`

		return cql;
	}

	export const selectAll = (tableName: string, subset: string[] | '*') => {
		const cql = `SELECT ${subset === '*' ? '*' : subset.join(', ')} `
			+ `FROM ${tableName};`;

		return cql;
	}

	export const select = (tableName: string, subset: string[] | '*', where: string[], allowFiltering: boolean = false) => {
		const cql = `SELECT ${subset === "*" ? "*" : subset.join(", ")}`
			+ ` FROM ${tableName}`
			+ ` WHERE ${where.map((column, i) => `(${column} = ?)`).join(' AND ')}`
			+ ` ${allowFiltering ? 'ALLOW FILTERING' : ''}`
			+ `;`;

		return cql;
	}

	export const dropTable = (tableName: string) => `DROP TABLE ${tableName};`;
}