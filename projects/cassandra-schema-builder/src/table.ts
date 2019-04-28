import { types as CTypes } from 'cassandra-driver';
import { CQL } from './cql';
import { isString } from 'util';

export interface Collection<T extends ColumnType> {
	type: T;
	collection: 'set' | 'list';
}

export enum ColumnType {
	ASCII = 'ascii',
	BigInt = 'bigint',
	Blob = 'blob',
	Boolean = 'boolean',
	Counter = 'counter',
	Date = 'date',
	Decimal = 'decimal',
	Double = 'double',
	Float = 'float',
	INet = 'inet',
	Int = 'int',
	SmallInt = 'smallint',
	Text = 'text',
	Time = 'time',
	Timestamp = 'timestamp',
	TimeUUID = 'timeuuid',
	TinyInt = 'tinyint',
	UUID = 'uuid',
	Varchar = 'varchar',
	VarInt = 'varint'
}

export const CSet = <T extends ColumnType>(type: T): Collection<T> => ({ collection: 'set', type });
export const CList = <T extends ColumnType>(type: T): Collection<T> => ({ collection: 'list', type });

export type ClusteringOrderSorting = 'desc' | 'asc';
export type ClusteringOrderIndexed = { index: number, order: ClusteringOrder };
export type ClusteringOrder = ClusteringOrderSorting | ClusteringOrderIndexed;

export interface Column {
	type: ColumnType | Collection<ColumnType>;
	partitionKey?: boolean;
	clusteringKey?: boolean;
	clusteringOrder?: ClusteringOrder;
	nullable?: boolean; // offers convinience to enfore certain properties (has no effect on the cql)
}

export interface Columns {
	[key: string]: Column;
}

export const TableSchema = <C extends Columns>(columns: C):
	{ [key in keyof C]: C[key] } => columns;

type BigInteger = BigInt | number;

type ColumnBaseType<C extends Column> =
	C extends { type: ColumnType.ASCII } ? string :
	C extends { type: ColumnType.BigInt } ? BigInteger :
	C extends { type: ColumnType.Blob } ? Buffer :
	C extends { type: ColumnType.Boolean } ? boolean :
	C extends { type: ColumnType.Counter } ? BigInteger :
	C extends { type: ColumnType.Date } ? CTypes.LocalDate :
	C extends { type: ColumnType.Decimal } ? CTypes.BigDecimal :
	C extends { type: ColumnType.Double } ? number :
	C extends { type: ColumnType.Float } ? number :
	C extends { type: ColumnType.INet } ? CTypes.InetAddress :
	C extends { type: ColumnType.SmallInt } ? number :
	C extends { type: ColumnType.Text } ? string :
	C extends { type: ColumnType.Time } ? CTypes.LocalTime :
	C extends { type: ColumnType.Timestamp } ? Date :
	C extends { type: ColumnType.TimeUUID } ? CTypes.TimeUuid :
	C extends { type: ColumnType.TinyInt } ? number :
	C extends { type: ColumnType.UUID } ? CTypes.Uuid :
	C extends { type: ColumnType.Varchar } ? string :
	C extends { type: ColumnType.VarInt } ? CTypes.Integer :
	C extends { type: Collection<ColumnType.ASCII> } ? string[] :
	C extends { type: Collection<ColumnType.BigInt> } ? BigInteger[] :
	C extends { type: Collection<ColumnType.Blob> } ? Buffer[] :
	C extends { type: Collection<ColumnType.Boolean> } ? boolean[] :
	C extends { type: Collection<ColumnType.Counter> } ? BigInteger[] :
	C extends { type: Collection<ColumnType.Date> } ? CTypes.LocalDate[] :
	C extends { type: Collection<ColumnType.Decimal> } ? CTypes.BigDecimal[] :
	C extends { type: Collection<ColumnType.Double> } ? number[] :
	C extends { type: Collection<ColumnType.Float> } ? number[] :
	C extends { type: Collection<ColumnType.INet> } ? CTypes.InetAddress[] :
	C extends { type: Collection<ColumnType.SmallInt> } ? number[] :
	C extends { type: Collection<ColumnType.Text> } ? string[] :
	C extends { type: Collection<ColumnType.Time> } ? CTypes.LocalTime[] :
	C extends { type: Collection<ColumnType.Timestamp> } ? Date[] :
	C extends { type: Collection<ColumnType.TimeUUID> } ? CTypes.TimeUuid[] :
	C extends { type: Collection<ColumnType.TinyInt> } ? number[] :
	C extends { type: Collection<ColumnType.UUID> } ? CTypes.Uuid[] :
	C extends { type: Collection<ColumnType.Varchar> } ? string[] :
	C extends { type: Collection<ColumnType.VarInt> } ? CTypes.Integer[] :
	unknown;

type ColumnTypeFinal<C extends Column> =
	C extends { partitionKey: true } ? ColumnBaseType<C> :
	C extends { clusteringKey: true } ? ColumnBaseType<C> :
	C extends { nullable: false } ? ColumnBaseType<C> :
	ColumnBaseType<C> | null;

export type TableRecord<C extends Columns> = {
	-readonly [key in keyof C]: ColumnTypeFinal<C[key]>;
};

type ColumnValuesBase<C extends Columns, Subset extends (keyof C)[]> =
	{ [key in keyof Subset]: TableRecord<C>[Extract<Subset[key], keyof C>] | CQLFunction };

type ColumnValues<C extends Columns, Subset extends (keyof C)[]> =
	ColumnValuesBase<C, Subset>[keyof Subset][] &
	ColumnValuesBase<C, Subset>;

export type IQuery<C extends Columns> = {
	cql: string;
	values?: unknown[];
	columns?: C; // stores result Columns, so that typescript doesn't forget about them
};

export const Query = (cql: string, values?: unknown[]): IQuery<{}> => ({ cql, values });

export enum NativeFunction {
	DateOf = 'dateOf()',
	Now = 'now()'
}

interface CQLFunction {
	func: NativeFunction | string;
}

export const CQLFunc = (cqlFunction: NativeFunction | string): CQLFunction => ({
	func: cqlFunction
});

const isCQLFunction = (value: any): value is CQLFunction => typeof value.func === 'string';

export interface ITable<C extends Columns> {
	readonly name: string;
	create(): IQuery<{}>;
	insert<Subset extends Keys<C>>(subset: Subset): (values: ColumnValues<C, Subset>) => IQuery<{}>;
	insertFromObj<Subset extends TableRecord<C>>(obj: Subset): IQuery<{}>;
	update<Subset extends Keys<C>, Where extends Keys<C>>(subset: Subset, where: Where):
		(subsetValues: ColumnValues<C, Subset>, whereValues: ColumnValues<C, Where>) => IQuery<{}>;
	selectAll<Subset extends Keys<C>>(subset: Subset | "*"):
		IQuery<Pick<C, Extract<Subset[number], string>>>;
	select<Subset extends Keys<C>, Where extends Keys<C>>(subset: Subset | "*", where: Where, allowFiltering?: boolean):
		(conditions: ColumnValues<C, Where>) => IQuery<Pick<C, Extract<Subset[number], string>>>;
	selectWhere(where: string, values: unknown[]): IQuery<C>;
	drop(): IQuery<{}>;
}

type NonEmpty<Type> = [Type, ...Type[]];
type Keys<C extends Columns> = (keyof C)[] & (NonEmpty<keyof C> | []);

export const Table =
	<Tables extends { [key: string]: Columns }, Table extends Extract<keyof Tables, string>>
		(tables: Tables, table: Table): ITable<Tables[Table]> => {
		const columns = tables[table];

		const injectCQLFunctionsIntoQuery = (query: IQuery<{}>): IQuery<{}> => {
			const values = query.values;

			/* istanbul ignore if */
			if (!values || values.length === 0) {
				return query;
			}

			const querySplit = query.cql.split('?');

			let i = values.length;
			while (i--) {
				const value = values[i];

				if (isCQLFunction(value)) {
					querySplit[i + 1] = value.func + ', ';
					values.splice(i, 1);
				} else {
					querySplit[i + 1] = '?' + (i === values.length - 1 ? ')' : ',');
				}
			}

			return {
				...query,
				values,
				cql: querySplit.join('')
			}
		}

		return {
			name: table,
			create: () => {
				return {
					cql: CQL.createTable(table, columns),
				};
			},
			insert: (subset) => (values) => injectCQLFunctionsIntoQuery({
				cql: CQL.insert(table, subset.filter(isString)),
				values
			}),
			insertFromObj: (obj) => {
				const subset = Object.keys(obj);
				const values = Object.values(obj);

				return {
					cql: CQL.insert(table, subset),
					values
				};
			},
			update: (subset, where) => (subsetValues, whereValues) => ({
				cql: CQL.update(table, subset.filter(isString), where.filter(isString)),
				values: subsetValues.concat(whereValues)
			}),
			selectAll: (subset) => {
				const cql = subset === '*'
					? CQL.selectAll(table, subset)
					: CQL.selectAll(table, subset.filter(isString));

				return {
					cql
				}
			},
			select: (subset, where, allowFiltering) => {
				const cql = subset === '*'
					? CQL.select(table, subset, where.filter(isString), allowFiltering)
					: CQL.select(table, subset.filter(isString), where.filter(isString), allowFiltering);

				return (values) => ({
					cql,
					values
				});
			},
			selectWhere: (where, values) => {
				return {
					cql: `SELECT * FROM ${table} WHERE ${where};`,
					values
				}
			},
			drop: () => ({
				cql: CQL.dropTable(table)
			})
		};
	};