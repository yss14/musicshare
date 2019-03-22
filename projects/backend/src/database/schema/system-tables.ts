import { TableSchema, ColumnType, TableRecord, Table } from "cassandra-schema-builder";

const SystemTables = {
	['system_schema.tables']: TableSchema({
		table_name: { type: ColumnType.Varchar, nullable: false },
		keyspace_name: { type: ColumnType.Varchar, nullable: false },
	})
}

export interface ITablesDBResult extends TableRecord<typeof SystemTables['system_schema.tables']> { }

export const Tables = Table(SystemTables, 'system_schema.tables');