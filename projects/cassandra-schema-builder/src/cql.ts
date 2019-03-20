import { Columns, ColumnType, Collection } from './table';

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

	export const createTable = (tableName: string, schema: Columns) => {
		const primaryKeys = Object.entries(schema)
			.filter(([_, value]) => value.primaryKey === true)
			.map(([key, _]) => key);

		if (primaryKeys.length === 0) {
			throw new CQLErrors.InvalidTableSchema('No primary key defined', tableName, schema);
		}

		const cql = [
			`CREATE TABLE ${tableName} (`,
			Object.entries(schema).map(([columnName, columnDef]) =>
				`	${columnName} ${mapColumnType(columnDef.type)},`).join('\n'),
			`	`,
			`	PRIMARY KEY(${primaryKeys.join(',')})`,
			`);`
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
}