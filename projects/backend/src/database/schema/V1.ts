import { TableSchema, ColumnType, PArray, NativeFunction, ForeignKeyUpdateDeleteRule, JSONType } from 'postgres-schema-builder';
import { IFile } from '../../models/interfaces/IFile';

export namespace DatabaseV1 {
	const baseSchema = TableSchema({
		date_added: { type: ColumnType.TimestampTZ, nullable: false, defaultValue: { func: NativeFunction.Now } },
		date_removed: { type: ColumnType.TimestampTZ, nullable: true },
	});

	export const users = TableSchema({
		...baseSchema,
		user_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		name: { type: ColumnType.Varchar, nullable: false },
		email: { type: ColumnType.Varchar, nullable: false },
		share_id_ref_lib: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'shares', targetColumn: 'share_id', onDelete: ForeignKeyUpdateDeleteRule.SetNull }] },
	});

	export const shares = TableSchema({
		...baseSchema,
		share_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		name: { type: ColumnType.Varchar, nullable: false },
	});

	export const user_shares = TableSchema({
		...baseSchema,
		share_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'shares', targetColumn: 'share_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
		user_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'users', targetColumn: 'user_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
		permissions: { type: PArray(ColumnType.Varchar), nullable: false },
	});

	export const songs = TableSchema({
		...baseSchema,
		song_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		title: { type: ColumnType.Varchar },
		suffix: { type: ColumnType.Varchar },
		year: { type: ColumnType.Integer },
		bpm: { type: ColumnType.Integer },
		date_last_edit: { type: ColumnType.TimestampTZ, nullable: false },
		release_date: { type: ColumnType.Date },
		is_rip: { type: ColumnType.Boolean },
		artists: { type: PArray(ColumnType.Varchar) },
		remixer: { type: PArray(ColumnType.Varchar) },
		featurings: { type: PArray(ColumnType.Varchar) },
		type: { type: ColumnType.Varchar },
		genres: { type: PArray(ColumnType.Varchar) },
		labels: { type: PArray(ColumnType.Varchar) },
		file: { type: JSONType<IFile>() },
		duration: { type: ColumnType.Integer, nullable: false },
		tags: { type: PArray(ColumnType.Varchar) },
	});

	export const share_songs = TableSchema({
		...baseSchema,
		share_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'shares', targetColumn: 'share_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
		song_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'songs', targetColumn: 'song_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
	});

	export const playlists = TableSchema({
		...baseSchema,
		playlist_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		name: { type: ColumnType.Varchar, nullable: false },
	});

	export const share_playlists = TableSchema({
		...baseSchema,
		share_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'shares', targetColumn: 'share_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
		playlist_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'playlists', targetColumn: 'playlist_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
	});

	export const playlist_songs = TableSchema({
		...baseSchema,
		playlist_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'playlists', targetColumn: 'playlist_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
		song_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'songs', targetColumn: 'song_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
		position: { type: ColumnType.Integer, createIndex: true, nullable: false },
	});

	export const song_types = TableSchema({
		...baseSchema,
		name: { type: ColumnType.Varchar, primaryKey: true },
		group: { type: ColumnType.Varchar, primaryKey: true },
		has_artists: { type: ColumnType.Boolean, nullable: false },
		alternative_names: { type: PArray(ColumnType.Varchar) },
		share_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'shares', targetColumn: 'share_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
	});

	export const genres = TableSchema({
		...baseSchema,
		name: { type: ColumnType.Varchar, primaryKey: true },
		group: { type: ColumnType.Varchar, primaryKey: true },
		share_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'shares', targetColumn: 'share_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
	});

	export const user_login_credentials = TableSchema({
		...baseSchema,
		user_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'users', targetColumn: 'user_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
		credential: { type: ColumnType.Varchar, nullable: false },
	});

	export const share_tokens = TableSchema({
		token_value: { type: ColumnType.Varchar, primaryKey: true },
		group: { type: ColumnType.Varchar, primaryKey: true },
		share_id_ref: { type: ColumnType.UUID, createIndex: true, foreignKeys: [{ targetTable: 'shares', targetColumn: 'share_id', onDelete: ForeignKeyUpdateDeleteRule.Cascade }] },
	});
}