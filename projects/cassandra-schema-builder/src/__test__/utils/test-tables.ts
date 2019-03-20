import { TableSchema, ColumnType, Table, CSet, CList } from "../../table";

export namespace TestTables {
	export const tableWithAllPrimitives = TableSchema({
		col_ascii: { type: ColumnType.ASCII, nullable: false, primaryKey: true },
		col_bigint: { type: ColumnType.BigInt, nullable: false },
		col_blob: { type: ColumnType.Blob, nullable: false },
		col_boolean: { type: ColumnType.Boolean, nullable: false },
		col_date: { type: ColumnType.Date, nullable: false },
		col_decimal: { type: ColumnType.Decimal, nullable: false },
		col_double: { type: ColumnType.Double, nullable: false },
		col_float: { type: ColumnType.Float, nullable: false },
		col_inet: { type: ColumnType.INet, nullable: false },
		col_int: { type: ColumnType.Int, nullable: false },
		col_smallint: { type: ColumnType.SmallInt, nullable: false },
		col_text: { type: ColumnType.Text, nullable: false },
		col_time: { type: ColumnType.Time, nullable: false },
		col_timestamp: { type: ColumnType.Timestamp, nullable: false },
		col_timeuuid: { type: ColumnType.TimeUUID, nullable: false },
		col_tinyint: { type: ColumnType.TinyInt, nullable: false },
		col_uuid: { type: ColumnType.UUID, nullable: false },
		col_varchar: { type: ColumnType.Varchar, nullable: false },
		col_varint: { type: ColumnType.VarInt, nullable: false },
	});

	export const tableWithAllSets = TableSchema({
		col_pk: { type: ColumnType.Int, primaryKey: true },
		col_set_ascii: { type: CSet(ColumnType.ASCII), nullable: false },
		col_set_bigint: { type: CSet(ColumnType.BigInt), nullable: false },
		col_set_blob: { type: CSet(ColumnType.Blob), nullable: false },
		col_set_boolean: { type: CSet(ColumnType.Boolean), nullable: false },
		col_set_date: { type: CSet(ColumnType.Date), nullable: false },
		col_set_decimal: { type: CSet(ColumnType.Decimal), nullable: false },
		col_set_double: { type: CSet(ColumnType.Double), nullable: false },
		col_set_float: { type: CSet(ColumnType.Float), nullable: false },
		col_set_inet: { type: CSet(ColumnType.INet), nullable: false },
		col_set_int: { type: CSet(ColumnType.Int), nullable: false },
		col_set_smallint: { type: CSet(ColumnType.SmallInt), nullable: false },
		col_set_text: { type: CSet(ColumnType.Text), nullable: false },
		col_set_time: { type: CSet(ColumnType.Time), nullable: false },
		col_set_timestamp: { type: CSet(ColumnType.Timestamp), nullable: false },
		col_set_timeuuid: { type: CSet(ColumnType.TimeUUID), nullable: false },
		col_set_tinyint: { type: CSet(ColumnType.TinyInt), nullable: false },
		col_set_uuid: { type: CSet(ColumnType.UUID), nullable: false },
		col_set_varchar: { type: CSet(ColumnType.Varchar), nullable: false },
		col_set_varint: { type: CSet(ColumnType.VarInt), nullable: false },
	});

	export const tableWithAllLists = TableSchema({
		col_pk: { type: ColumnType.Int, primaryKey: true },
		col_list_ascii: { type: CList(ColumnType.ASCII), nullable: false },
		col_list_bigint: { type: CList(ColumnType.BigInt), nullable: false },
		col_list_blob: { type: CList(ColumnType.Blob), nullable: false },
		col_list_boolean: { type: CList(ColumnType.Boolean), nullable: false },
		col_list_date: { type: CList(ColumnType.Date), nullable: false },
		col_list_decimal: { type: CList(ColumnType.Decimal), nullable: false },
		col_list_double: { type: CList(ColumnType.Double), nullable: false },
		col_list_float: { type: CList(ColumnType.Float), nullable: false },
		col_list_inet: { type: CList(ColumnType.INet), nullable: false },
		col_list_int: { type: CList(ColumnType.Int), nullable: false },
		col_list_smallint: { type: CList(ColumnType.SmallInt), nullable: false },
		col_list_text: { type: CList(ColumnType.Text), nullable: false },
		col_list_time: { type: CList(ColumnType.Time), nullable: false },
		col_list_timestamp: { type: CList(ColumnType.Timestamp), nullable: false },
		col_list_timeuuid: { type: CList(ColumnType.TimeUUID), nullable: false },
		col_list_tinyint: { type: CList(ColumnType.TinyInt), nullable: false },
		col_list_uuid: { type: CList(ColumnType.UUID), nullable: false },
		col_list_varchar: { type: CList(ColumnType.Varchar), nullable: false },
		col_list_varint: { type: CList(ColumnType.VarInt), nullable: false },
	});
}

export const testTableWithAllPrimitives = Table(TestTables, 'tableWithAllPrimitives');
export const testTableWithAllSets = Table(TestTables, 'tableWithAllSets');
export const testTableWithAllLists = Table(TestTables, 'tableWithAllLists');