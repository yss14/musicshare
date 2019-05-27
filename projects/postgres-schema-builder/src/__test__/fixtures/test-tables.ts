import { TableSchema, ColumnType, ForeignKeyUpdateDeleteRule, Table } from "../../table";

export namespace TestTables {
	export const test_table_a = TableSchema({
		id: { type: ColumnType.Integer, primaryKey: true, autoIncrement: true },
		some_str: { type: ColumnType.Varchar, nullable: false, createIndex: true, unique: true },
	});

	export const test_table_b = TableSchema({
		id: { type: ColumnType.Integer, primaryKey: true, autoIncrement: true },
		test_id_ref: { type: ColumnType.Integer, foreignKeys: [{ targetTable: 'test_table_a', targetColumn: 'id', onUpdate: ForeignKeyUpdateDeleteRule.Cascade }] }
	});
}

export const TestTableA = Table(TestTables, 'test_table_a');
export const TestTableB = Table(TestTables, 'test_table_b');