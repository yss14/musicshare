import { Columns, Column, IReferenceConstraintInternal, isCollection, isSQLFunction, ForeignKeyUpdateDeleteRule, ICreateIndexStatement, IQuery } from "./table";
import { flatten } from 'lodash';
import * as pgEscape from 'pg-escape';
import { dateToSQLUTCFormat } from "./sql-utils";
import moment = require("moment");

export namespace SQL {
	export const createDatabase = (name: string) => `CREATE DATABASE ${name} IF NOT EXISTS;`;

	export const createTable = (name: string, columns: Columns): string => {
		const entries = Object.entries(columns).map(([name, column]) => ({ name, ...column }));
		const foreignKeyConstraints: IReferenceConstraintInternal[] = collectForeignKeyConstraints(entries);

		const primaryKeyColoumns = entries.filter(col => {
			return col.primaryKey !== undefined && col.primaryKey;
		});

		const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${name} (
				${entries
				.map(prepareCreateColumnStatement)
				.concat([
					`CONSTRAINT PK_${name}_${primaryKeyColoumns.map(pkc => pkc.name).join('_')} PRIMARY KEY (${primaryKeyColoumns.map(pkc => pkc.name).join(',')})`
				])
				.concat(
					prepareForeignKeyConstraintStatements(name, foreignKeyConstraints)
						.map(stmt => `CONSTRAINT ${stmt}`)
				)
				.join(',\n')}
            );
		`;

		let indexStatements: ICreateIndexStatement[] = entries.filter((col): boolean => {
			return (col.unique !== undefined && col.unique) || (col.createIndex !== undefined && col.createIndex);
		}).map((col) => {
			return {
				column: col.name,
				unique: col.unique !== undefined && col.unique
			}
		});

		const createIndexQueries = indexStatements.map(indexStatement => createIndex(indexStatement.unique, name, indexStatement.column));

		return `
			${createTableQuery}
			${createIndexQueries.join('\n')}
		`;
	}

	export const insert = (tableName: string, subset: string[]) => {
		const cql = `INSERT INTO ${tableName}`
			+ ` ( ${subset.join(", ")} )`
			+ ` VALUES ( ${subset.map((_, idx) => `$${idx + 1}`).join(', ')} );`;

		return cql;
	}

	export const update = (tableName: string, subset: string[], where: string[]) => {
		const cql = `UPDATE ${tableName} `
			+ `SET ${subset.map((col, idx) => `${col} = $${idx + 1}`).join(', ')} `
			+ `WHERE ${where.map((col, idx) => `${col} = $${subset.length + idx + 1}`).join(' AND ')};`

		return cql;
	}

	export const selectAll = (tableName: string, subset: string[] | '*') => {
		const cql = `SELECT ${subset === '*' ? '*' : subset.join(', ')} `
			+ `FROM ${tableName};`;

		return cql;
	}

	export const select = (tableName: string, subset: string[] | '*', where: string[]) => {
		const cql = `SELECT ${subset === "*" ? "*" : subset.join(", ")}`
			+ ` FROM ${tableName}`
			+ ` WHERE ${where.map((column, i) => `(${column} = $${i + 1})`).join(' AND ')}`
			+ `;`;

		return cql;
	}

	export const dropTable = (tableName: string) => `DROP TABLE ${tableName};`;

	export const createIndex = (unique: boolean, name: string, column: string): string => {
		const sql = `CREATE ${unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS ${name}_${column}_${unique ? 'u' : ''}index ON ${name} (${column});`

		return sql;
	}

	export const raw = <T extends {}>(sql: string, values: unknown[] = []): IQuery<T> => ({
		sql,
		values
	});
}

const collectForeignKeyConstraints = (columns: ({ name: string } & Column)[]): IReferenceConstraintInternal[] => flatten(
	columns.map(col => col.foreignKeys
		? col.foreignKeys.map(fkc => ({ ...fkc, column: col.name }))
		: []
	)
);

const prepareCreateColumnStatement = (col: ({ name: string } & Column)): string => {
	let replaceArr: any[] = [];

	if (col.defaultValue !== undefined) {
		replaceArr.push(col.defaultValue);
	}

	return `${col.name} ${!col.autoIncrement ? mapColumnType(col) : ''} ` +
		`${col.autoIncrement ? 'SERIAL ' : ''}` +
		`${col.nullable !== undefined && !col.nullable ? 'NOT NULL ' : ''}` +
		`${col.defaultValue !== undefined ? `DEFAULT ${isSQLFunction(col.defaultValue) ?
			col.defaultValue.func : mapValues(col.defaultValue)}` : ''}`;
}

const prepareForeignKeyConstraintStatements = (tableName: string, foreignKeyConstraints: IReferenceConstraintInternal[]): string[] => {
	return foreignKeyConstraints
		.map(fkc =>
			`${tableName}_${fkc.column}_fkey
			FOREIGN KEY (${fkc.column}) REFERENCES ${fkc.targetTable} (${fkc.targetColumn})
			${fkc.onDelete !== undefined ? mapUpdateDeleteRule(fkc.onDelete, false) : ''}
			${fkc.onUpdate !== undefined ? mapUpdateDeleteRule(fkc.onUpdate, true) : ''}`
		);
}

const mapColumnType = (col: Column) => {
	if (typeof (col.type) === "object") {
		if ("json" in col.type) {
			return "JSON";
		}
	} else if (isCollection(col.type)) {
		return col.type.toUpperCase() + '[]';
	} else {
		return col.type.toUpperCase();
	}

	throw new Error(`Unknown column type ${col.type}`);
}

const mapValues = (val: any): any => {
	if (val === undefined || val === null) {
		return 'NULL';
	} else if (typeof val === 'string') {
		return pgEscape('%L', val);
	} else if (moment.isMoment(val)) {
		return `'${dateToSQLUTCFormat(val.utc().toDate())}'`;
	} else if (val instanceof Date) {
		return `'${dateToSQLUTCFormat(val)}'`;
	} else if (typeof val === 'object') {
		return mapValues(JSON.stringify(val));
	} else {
		return val;
	}
}

const mapUpdateDeleteRule = (rule: ForeignKeyUpdateDeleteRule, isUpdate: boolean): string => {
	const prefix = isUpdate ? 'UPDATE' : 'DELETE';

	switch (rule) {
		case ForeignKeyUpdateDeleteRule.Cascade: return `ON ${prefix} CASCADE`;
		case ForeignKeyUpdateDeleteRule.NoAction: return '';
		case ForeignKeyUpdateDeleteRule.Restrict: return '';
		case ForeignKeyUpdateDeleteRule.SetDefault: return `ON ${prefix} SET DEFAULT`;
		case ForeignKeyUpdateDeleteRule.SetNull: return `ON ${prefix} SET NULL`;
	}
}