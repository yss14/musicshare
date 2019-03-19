import { Columns } from './table';

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
	export const createTable = (name: string, schema: Columns) => {
		const primaryKeys = Object.entries(schema)
			.filter(([_, value]) => value.primaryKey === true)
			.map(([key, _]) => key);

		if (primaryKeys.length === 0) {
			throw new CQLErrors.InvalidTableSchema('No primary key defined', name, schema);
		}

		const sql = [
			`CREATE TABLE ${name} (`,
			Object.entries(schema).map(([columnName, columnDef]) =>
				`	${columnName} ${columnDef.type},`).join('\n'),
			`	`,
			`	PRIMARY KEY(${primaryKeys.join(',')})`,
			`);`
		];

		return sql.join('\n');
	}
}