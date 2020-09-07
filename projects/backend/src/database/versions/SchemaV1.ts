import {
	TableSchema,
	ColumnType,
	PArray,
	NativeFunction,
	ForeignKeyUpdateDeleteRule,
	JSONType,
} from "postgres-schema-builder"
import { IFileSourceJSONType } from "../../models/FileSourceModels"
import { ISongProcessingQueuePayload } from "../../job-queues/SongUploadProcessingQueue"
import { Nullable } from "../../types/Nullable"
import { BaseSong } from "@musicshare/shared-types"

export namespace DatabaseV1 {
	const baseSchema = TableSchema({
		date_added: { type: ColumnType.TimestampTZ, nullable: false, defaultValue: { func: NativeFunction.Now } },
		date_removed: { type: ColumnType.TimestampTZ, nullable: true },
	})

	export const users = TableSchema({
		...baseSchema,
		user_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		name: { type: ColumnType.Varchar, nullable: false },
		email: { type: ColumnType.Varchar, nullable: false },
		invitation_token: { type: ColumnType.Varchar, nullable: true },
	})

	export const shares = TableSchema({
		...baseSchema,
		share_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		name: { type: ColumnType.Varchar, nullable: false },
		is_library: { type: ColumnType.Boolean, nullable: false },
	})

	export const user_shares = TableSchema({
		...baseSchema,
		share_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "shares", targetColumn: "share_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		user_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "users", targetColumn: "user_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		permissions: { type: PArray(ColumnType.Varchar), nullable: false },
	})

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
		sources: { type: JSONType<IFileSourceJSONType>(), nullable: false },
		duration: { type: ColumnType.Integer, nullable: false },
		tags: { type: PArray(ColumnType.Varchar) },
		requires_user_action: { type: ColumnType.Boolean, nullable: false, default: false },
	})

	export const playlists = TableSchema({
		...baseSchema,
		playlist_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		name: { type: ColumnType.Varchar, nullable: false },
	})

	export const share_playlists = TableSchema({
		...baseSchema,
		share_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "shares", targetColumn: "share_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		playlist_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "playlists", targetColumn: "playlist_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
	})

	export const share_songs = TableSchema({
		...baseSchema,
		share_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "shares", targetColumn: "share_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		song_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "songs", targetColumn: "song_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		play_count: {
			type: ColumnType.Integer,
			nullable: false,
			defaultValue: 0,
		},
	})

	export const playlist_songs = TableSchema({
		...baseSchema,
		playlist_song_id: { type: ColumnType.UUID, primaryKey: true, unique: true },
		playlist_id_ref: {
			type: ColumnType.UUID,
			createIndex: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "playlists", targetColumn: "playlist_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		song_id_ref: {
			type: ColumnType.UUID,
			createIndex: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "songs", targetColumn: "song_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		position: { type: ColumnType.Integer, createIndex: true, nullable: false },
	})

	export const song_types = TableSchema({
		...baseSchema,
		name: { type: ColumnType.Varchar, primaryKey: true },
		group: { type: ColumnType.Varchar, primaryKey: true },
		has_artists: { type: ColumnType.Boolean, nullable: false },
		alternative_names: { type: PArray(ColumnType.Varchar) },
		share_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "shares", targetColumn: "share_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
	})

	export const genres = TableSchema({
		...baseSchema,
		name: { type: ColumnType.Varchar, primaryKey: true },
		group: { type: ColumnType.Varchar, primaryKey: true },
		share_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "shares", targetColumn: "share_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
	})

	export const user_login_credentials = TableSchema({
		...baseSchema,
		user_login_credential_id: { type: ColumnType.Integer, primaryKey: true, unique: true, autoIncrement: true },
		user_id_ref: {
			type: ColumnType.UUID,
			createIndex: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "users", targetColumn: "user_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		credential: { type: ColumnType.Varchar, nullable: false },
		restore_token: { type: ColumnType.Varchar, nullable: true },
	})

	export const share_tokens = TableSchema({
		token_value: { type: ColumnType.Varchar, primaryKey: true },
		group: { type: ColumnType.Varchar, primaryKey: true },
	})

	export const file_upload_logs = TableSchema({
		...baseSchema,
		file_upload_log_id: { type: ColumnType.UUID, primaryKey: true, unique: true, autoIncrement: true },
		file: { type: JSONType<ISongProcessingQueuePayload>(), nullable: false },
		meta: { type: JSONType<Partial<Nullable<BaseSong>>>(), nullable: true },
		error: { type: ColumnType.Varchar, nullable: true },
		user_id_ref: {
			type: ColumnType.UUID,
			createIndex: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "users", targetColumn: "user_id", onDelete: ForeignKeyUpdateDeleteRule.NoAction },
			],
		},
	})

	export const song_plays = TableSchema({
		song_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "songs", targetColumn: "song_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		user_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "users", targetColumn: "user_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		share_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "shares", targetColumn: "share_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
		date_added: {
			type: ColumnType.TimestampTZ,
			primaryKey: true,
			nullable: false,
			defaultValue: { func: NativeFunction.Now },
		},
	})
}
