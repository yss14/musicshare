import { TableSchema, ColumnType, CSet } from 'cassandra-schema-builder';

export namespace DatabaseV1 {
	export const users = TableSchema({
		id: { type: ColumnType.TimeUUID, primaryKey: true },
		name: { type: ColumnType.Varchar },
		emails: { type: CSet<ColumnType.Boolean>() }
	});

	export const sharesByUser = TableSchema({
		id: { type: ColumnType.TimeUUID, primaryKey: true },
		name: { type: ColumnType.Varchar },
		user_id: { type: ColumnType.TimeUUID, primaryKey: true },
		is_library: { type: ColumnType.Boolean }
	});

	export const songByShare = TableSchema({
		id: { type: ColumnType.TimeUUID, primaryKey: true },
		title: { type: ColumnType.Varchar },
		suffix: { type: ColumnType.Varchar },
		year: { type: ColumnType.Int },
		bpm: { type: ColumnType.SmallInt },
		date_last_edit: { type: ColumnType.Timestamp },
		release_date: { type: ColumnType.Date },
		is_rip: { type: ColumnType.Boolean },
		artists: { type: CSet<ColumnType.Varchar>() },
		remixer: { type: CSet<ColumnType.Varchar>() },
		featurings: { type: CSet<ColumnType.Varchar>() },
		type: { type: ColumnType.Varchar },
		genres: { type: CSet<ColumnType.Varchar>() },
		label: { type: ColumnType.Varchar },
		share_id: { type: ColumnType.TimeUUID, primaryKey: true },
		requires_user_action: { type: ColumnType.Boolean },
		file: { type: ColumnType.Varchar },
	});
}