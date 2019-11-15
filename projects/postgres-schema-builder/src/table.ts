import { SQL } from "./sql";
import { isString } from 'util';

export interface Collection<T extends ColumnType> {
	type: T;
	collection: 'array';
}

export const isCollection = (obj: any): obj is Collection<ColumnType> => obj.collection === 'array';

export const PArray = <T extends ColumnType>(type: T): Collection<T> => ({ collection: 'array', type });

export enum ColumnType {
	BigInt = 'bigint',
	Boolean = 'boolean',
	Varchar = 'varchar',
	Date = 'date',
	Integer = 'integer',
	Text = 'text',
	Timestamp = 'timestamp',
	TimestampTZ = 'timestamptz',
	UUID = 'uuid',
}

export enum ForeignKeyUpdateDeleteRule {
	Cascade,
	Restrict,
	SetNull,
	NoAction,
	SetDefault
}

export interface IReferenceConstraint {
	targetTable: string,
	targetColumn: string,
	onUpdate?: ForeignKeyUpdateDeleteRule,
	onDelete?: ForeignKeyUpdateDeleteRule
}

export interface IReferenceConstraintInternal extends IReferenceConstraint {
	column: string;
}

export interface ICreateIndexStatement {
	table?: string,
	column: string,
	unique: boolean
}

export interface Column {
	type: ColumnType | Collection<ColumnType> | IColumnTypeJson<unknown>;
	primaryKey?: boolean;
	defaultValue?: unknown | SQLFunction;
	nullable?: boolean;
	autoIncrement?: boolean;
	foreignKeys?: IReferenceConstraint[];
	createIndex?: boolean;
	unique?: boolean;
}

export interface Columns {
	[key: string]: Column;
}

export interface IColumnTypeJson<Type> {
	json: true,
	sample?: Type;
}

export const JSONType = <Type>(): IColumnTypeJson<Type> => ({ json: true });
export const isJSONType = (type: any): type is IColumnTypeJson<unknown> => typeof type === 'object' && type.json === true;

type BigInteger = BigInt | number;

export const TableSchema = <C extends Columns>(columns: C):
	{ [key in keyof C]: C[key] } => columns;

type ColumnBaseType<C extends Column> =
	C extends { type: ColumnType.BigInt } ? BigInteger :
	C extends { type: ColumnType.Boolean } ? boolean :
	C extends { type: ColumnType.Varchar } ? string :
	C extends { type: ColumnType.Date } ? Date :
	C extends { type: ColumnType.Integer } ? number :
	C extends { type: ColumnType.Text } ? string :
	C extends { type: ColumnType.Timestamp } ? Date :
	C extends { type: ColumnType.TimestampTZ } ? Date :
	C extends { type: ColumnType.UUID } ? string :
	C extends { type: Collection<ColumnType.BigInt> } ? BigInteger[] :
	C extends { type: Collection<ColumnType.Boolean> } ? boolean[] :
	C extends { type: Collection<ColumnType.Varchar> } ? string[] :
	C extends { type: Collection<ColumnType.Date> } ? Date[] :
	C extends { type: Collection<ColumnType.Integer> } ? number[] :
	C extends { type: Collection<ColumnType.Text> } ? string[] :
	C extends { type: Collection<ColumnType.Timestamp> } ? Date[] :
	C extends { type: Collection<ColumnType.TimestampTZ> } ? Date[] :
	C extends { type: Collection<ColumnType.UUID> } ? string[] :
	C extends { type: IColumnTypeJson<unknown> } ? Required<C["type"]>["sample"] :
	unknown;

type ColumnTypeFinal<C extends Column> =
	C extends { primaryKey: true } ? ColumnBaseType<C> :
	C extends { defaultValue: {} } ? ColumnBaseType<C> :
	C extends { nullable: false } ? ColumnBaseType<C> :
	ColumnBaseType<C> | null;

export type TableRecord<C extends Columns> = {
	-readonly [key in keyof C]: ColumnTypeFinal<C[key]>;
};

export enum NativeFunction {
	Now = 'now()'
}

interface SQLFunction {
	func: NativeFunction | string;
}

export const SQLFunc = (cqlFunction: NativeFunction | string): SQLFunction => ({
	func: cqlFunction
});

export const isSQLFunction = (value: any): value is SQLFunction => typeof value.func === 'string';

type ColumnValuesBase<C extends Columns, Subset extends (keyof C)[]> =
	{ [key in keyof Subset]: TableRecord<C>[Extract<Subset[key], keyof C>] | SQLFunction };

type ColumnValues<C extends Columns, Subset extends (keyof C)[]> =
	ColumnValuesBase<C, Subset>[keyof Subset][] &
	ColumnValuesBase<C, Subset>;

export type IQuery<C extends Columns> = {
	sql: string;
	values?: unknown[];
	columns?: C;
};

export const Query = (sql: string, values?: unknown[]): IQuery<{}> => ({ sql, values });

type NonEmpty<Type> = [Type, ...Type[]];
export type Keys<C extends Columns> = (keyof C)[] & (NonEmpty<keyof C> | []);

export interface ITable<C extends Columns> {
	readonly name: string;
	create(): IQuery<{}>;
	insert<Subset extends Keys<C>>(subset: Subset): (values: ColumnValues<C, Subset>) => IQuery<{}>;
	insertFromObj<Subset extends TableRecord<C>>(obj: Partial<Subset>): IQuery<{}>;
	update<Subset extends Keys<C>, Where extends Keys<C>>(subset: Subset, where: Where):
		(subsetValues: ColumnValues<C, Subset>, whereValues: ColumnValues<C, Where>) => IQuery<{}>;
	selectAll<Subset extends Keys<C>>(subset: Subset | "*"):
		IQuery<Pick<C, Extract<Subset[number], string>>>;
	select<Subset extends Keys<C>, Where extends Keys<C>>(subset: Subset | "*", where: Where, allowFiltering?: boolean):
		(conditions: ColumnValues<C, Where>) => IQuery<Pick<C, Extract<Subset[number], string>>>;
	drop(): IQuery<{}>;
	delete<Where extends Keys<C>>(where: Where): (conditions: ColumnValues<C, Where>) => IQuery<{}>;
}

export const Table =
	<Tables extends { [key: string]: Columns }, Table extends Extract<keyof Tables, string>>
		(tables: Tables, table: Table): ITable<Tables[Table]> => {
		const columns = tables[table];

		return {
			name: table,
			create: () => ({
				sql: SQL.createTable(table, columns)
			}),
			insert: (subset) => (values) => ({
				sql: SQL.insert(table, subset.filter(isString)),
				values
			}),
			insertFromObj: (obj) => {
				const subset = Object.keys(obj);
				const values = Object.values(obj);

				return {
					sql: SQL.insert(table, subset),
					values
				};
			},
			update: (subset, where) => (subsetValues, whereValues) => ({
				sql: SQL.update(table, subset.filter(isString), where.filter(isString)),
				values: [...subsetValues, ...whereValues],
			}),
			selectAll: (subset) => {
				const sql = subset === '*'
					? SQL.selectAll(table, subset)
					: SQL.selectAll(table, subset.filter(isString));

				return {
					sql
				}
			},
			select: (subset, where) => {
				const sql = subset === '*'
					? SQL.select(table, subset, where.filter(isString))
					: SQL.select(table, subset.filter(isString), where.filter(isString));

				return (values) => ({
					sql,
					values
				});
			},
			drop: () => ({
				sql: SQL.dropTable(table)
			}),
			delete: (where) => {
				const sql = SQL.deleteEntry(table, where.filter(isString))

				return (values) => ({
					sql,
					values,
				})
			}
		}
	}