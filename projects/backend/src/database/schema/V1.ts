import { TableSchema, ColumnType, CSet } from 'cassandra-schema-builder';

export namespace DatabaseV1 {
	export const users = TableSchema({
		id: { type: ColumnType.TimeUUID, partitionKey: true },
		name: { type: ColumnType.Varchar, nullable: false },
		emails: { type: CSet(ColumnType.Varchar), nullable: false }
	});

	export const sharesByUser = TableSchema({
		id: { type: ColumnType.TimeUUID, clusteringKey: true },
		name: { type: ColumnType.Varchar, nullable: false },
		user_id: { type: ColumnType.TimeUUID, partitionKey: true },
		is_library: { type: ColumnType.Boolean, nullable: false }
	});

	export const songByShare = TableSchema({
		id: { type: ColumnType.TimeUUID, clusteringKey: true },
		title: { type: ColumnType.Varchar },
		suffix: { type: ColumnType.Varchar },
		year: { type: ColumnType.Int },
		bpm: { type: ColumnType.SmallInt },
		date_last_edit: { type: ColumnType.Timestamp, nullable: false },
		release_date: { type: ColumnType.Date },
		is_rip: { type: ColumnType.Boolean },
		artists: { type: CSet(ColumnType.Varchar) },
		remixer: { type: CSet(ColumnType.Varchar) },
		featurings: { type: CSet(ColumnType.Varchar) },
		type: { type: ColumnType.Varchar },
		genres: { type: CSet(ColumnType.Varchar) },
		label: { type: ColumnType.Varchar },
		share_id: { type: ColumnType.TimeUUID, partitionKey: true },
		requires_user_action: { type: ColumnType.Boolean, nullable: false },
		file: { type: ColumnType.Varchar },
	});
}