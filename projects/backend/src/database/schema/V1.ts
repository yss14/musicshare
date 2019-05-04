import { TableSchema, ColumnType, CSet } from 'cassandra-schema-builder';

export namespace DatabaseV1 {
	const baseSchema = TableSchema({
		date_removed: { type: ColumnType.Timestamp },
	});

	export const song_base_schema = TableSchema({
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
		file: { type: ColumnType.Varchar },
		duration: { type: ColumnType.Int, nullable: false },
	});

	export const users = TableSchema({
		id: { type: ColumnType.TimeUUID, partitionKey: true },
		name: { type: ColumnType.Varchar, nullable: false },
		email: { type: ColumnType.Varchar, clusteringKey: true },
	});

	export const shares_by_user = TableSchema({
		id: { type: ColumnType.TimeUUID, clusteringKey: true },
		name: { type: ColumnType.Varchar, nullable: false },
		user_id: { type: ColumnType.TimeUUID, partitionKey: true },
		is_library: { type: ColumnType.Boolean, nullable: false }
	});

	export const songs_by_shares = TableSchema({
		...song_base_schema,
		requires_user_action: { type: ColumnType.Boolean, nullable: false },
	});

	export const song_types_by_share = TableSchema({
		name: { type: ColumnType.Varchar, clusteringKey: true },
		group: { type: ColumnType.Varchar, clusteringKey: true },
		has_artists: { type: ColumnType.Boolean, nullable: false },
		alternative_names: { type: CSet(ColumnType.Varchar) },
		share_id: { type: ColumnType.TimeUUID, partitionKey: true },
		date_added: { type: ColumnType.Timestamp, nullable: false },
		date_removed: { type: ColumnType.Timestamp },
	});

	export const genres_by_share = TableSchema({
		...baseSchema,
		name: { type: ColumnType.Varchar, clusteringKey: true },
		group: { type: ColumnType.Varchar, clusteringKey: true },
		share_id: { type: ColumnType.TimeUUID, partitionKey: true },
		date_added: { type: ColumnType.Timestamp, nullable: false },
	});

	export const user_login_credentials = TableSchema({
		email: { type: ColumnType.Varchar, partitionKey: true },
		user_id: { type: ColumnType.TimeUUID, clusteringKey: true },
		credential: { type: ColumnType.Varchar, nullable: false },
	});

	export const playlists_by_share = TableSchema({
		...baseSchema,
		id: { type: ColumnType.TimeUUID, clusteringKey: true },
		share_id: { type: ColumnType.TimeUUID, partitionKey: true },
		name: { type: ColumnType.Varchar, nullable: false },
	});

	export const songs_by_playlist = TableSchema({
		...baseSchema,
		...song_base_schema,
		share_id: { type: ColumnType.TimeUUID, nullable: false }, // not required to be partitionKey for our queries
		playlist_id: { type: ColumnType.TimeUUID, partitionKey: true },
		position: { type: ColumnType.Int, nullable: false },
		date_added: { type: ColumnType.Timestamp, nullable: false },
	});
}