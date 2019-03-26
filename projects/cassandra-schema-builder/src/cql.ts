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
			CREATE KEYSPACE ${keyspaceName}
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

		const entriesWithIndexSorted = entriesWithIndex.sort((lhs, rhs) => rhs[1].index - lhs[1].index);

		return entriesWithIndexSorted.concat(entriesWithoutIndex
			.map((entry): [string, ClusteringOrderIndexed] => [entry[0], { index: Number.MAX_SAFE_INTEGER, order: entry[1] }]));
	}

	export const createTable = (tableName: string, schema: Columns) => {
		const partititionKeys = Object.entries(schema)
			.filter(([_, value]) => value.partitionKey === true)
			.map(([key, _]) => key);
		const clusteringKeys = Object.entries(schema)
			.filter(([_, value]) => value.clusteringKey === true)
			.map(([key, _]) => key);
		const clusteringColumns = sortClusteringColumns(
			Object.entries(schema)
				.filter(([_, value]) => value.clusteringKey === true && value.clusteringOrder !== undefined)
				.map(([key, value]): [string, ClusteringOrder] => [key, value.clusteringOrder!])
		);

		if (partititionKeys.length === 0) {
			throw new CQLErrors.InvalidTableSchema('No primary key defined', tableName, schema);
		}

		if (clusteringKeys.length === 0 && clusteringColumns.length > 0) {
			throw new CQLErrors.InvalidTableSchema('Cannot define clustering order without having clustering key(s)', tableName, schema);
		}

		const primaryKey = `(${partititionKeys.join(',')})${clusteringKeys.length ? `, ${clusteringKeys.join(', ')}` : ''}`;
		const clusteringOrder = clusteringColumns.length ? ` WITH CLUSTERING ORDER BY (${clusteringColumns.map(col => `${col[0]} ${col[1].order.toString().toUpperCase()}`)})` : '';

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