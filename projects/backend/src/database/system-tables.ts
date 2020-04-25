import { TableSchema, ColumnType, TableRecord, Table } from "postgres-schema-builder"

/* istanbul ignore file */

const SystemTables = {
	["system_schema.tables"]: TableSchema({
		table_name: { type: ColumnType.Varchar, nullable: false },
		keyspace_name: { type: ColumnType.Varchar, nullable: false },
	}),
}

export interface ITablesDBResult extends TableRecord<typeof SystemTables["system_schema.tables"]> {}

export const Tables = Table(SystemTables, "system_schema.tables")
