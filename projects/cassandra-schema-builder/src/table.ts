import { types as CTypes } from 'cassandra-driver';
import { CQL } from './cql';

interface Collection<T extends ColumnType> {
	type?: T;
	collection: true;
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

export const CSet = <T extends ColumnType>(): Collection<T> => ({ collection: true });
export const CList = <T extends ColumnType>(): Collection<T> => ({ collection: true });

export interface Column {
	type: ColumnType | Collection<ColumnType>;
	primaryKey?: boolean;
}

export interface Columns {
	[key: string]: Column;
}

export const TableSchema = (columns: Columns):
	{ [key in keyof Columns]: Columns[key] } => columns;

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
	C extends { primaryKey: true } ? ColumnBaseType<C> :
	ColumnBaseType<C> | null;

export type TableRecord<C extends Columns> = {
	-readonly [key in keyof C]: ColumnTypeFinal<C[key]>
};

export type IQuery<C extends Columns[]> = {
	name?: string;
	cql: string;
	values?: unknown[];
	columns?: C; // stores result Columns, so that typescript doesn't forget about them
};

export interface ITable<C extends Columns> {
	readonly name: string;
	column<Column extends keyof C>(column: Column): Column;
	create(): IQuery<[{}]>;
}

export const Table =
	<Tables extends { [key: string]: Columns }, Table extends Extract<keyof Tables, string>>
		(tables: Tables, table: Table): ITable<Tables[Table]> => {
		const columns = tables[table];

		return {
			name: table,
			column: (column) => column,
			create: () => {
				return {
					cql: CQL.createTable(table, columns),
				};
			}
		};
	};