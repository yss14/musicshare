import { ColumnType, ForeignKeyUpdateDeleteRule, TableRecord, TableSchema, View } from "postgres-schema-builder"
import { Tables } from "./tables"

export namespace Views {
	export const share_songs_view = TableSchema({
		...Tables.songs,
		share_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "shares", targetColumn: "share_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
	})

	export const user_songs_view = TableSchema({
		...share_songs_view,
		user_id_ref: {
			type: ColumnType.UUID,
			primaryKey: true,
			nullable: false,
			foreignKeys: [
				{ targetTable: "users", targetColumn: "user_id", onDelete: ForeignKeyUpdateDeleteRule.Cascade },
			],
		},
	})

	export const share_song_plays_view = TableSchema({
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
		plays: {
			type: ColumnType.Integer,
			nullable: false,
		},
	})
}

export type IShareSongsViewDBResult = TableRecord<typeof Views.share_songs_view>
export type IUserSongsViewDBResult = TableRecord<typeof Views.user_songs_view>
export type IShareSongPlaysViewDBResult = TableRecord<typeof Views.share_song_plays_view>

export const ShareSongsView = View({
	views: Views,
	view: "share_songs_view",
	dependencies: ["songs", "shares", "user_shares"],
	query: `
		SELECT 
			library_songs.*,
			library_songs.library_id_ref as share_id_ref
		FROM songs as library_songs
		INNER JOIN shares as user_libraries ON user_libraries.share_id = library_songs.library_id_ref
		INNER JOIN user_shares as user_shares_libraries ON user_shares_libraries.share_id_ref = user_libraries.share_id
		INNER JOIN user_shares as user_shares_share ON user_shares_share.share_id_ref = user_shares_libraries.share_id_ref
		WHERE user_libraries.date_removed IS NULL
			AND library_songs.date_removed IS NULL

		UNION ALL

		SELECT 
			member_library_songs.*,
			shares.share_id as share_id_ref
		FROM shares
		INNER JOIN user_shares share_members ON shares.share_id = share_members.share_id_ref
		INNER JOIN user_shares share_member_shares ON share_member_shares.user_id_ref = share_members.user_id_ref
		INNER JOIN shares as member_libaries ON member_libaries.share_id = share_member_shares.share_id_ref
		INNER JOIN songs as member_library_songs ON member_library_songs.library_id_ref = member_libaries.share_id
		WHERE shares.date_removed IS NULL
			AND member_libaries.date_removed IS NULL
			AND member_libaries.is_library = TRUE
			AND shares.is_library = FALSE
			AND member_library_songs.date_removed IS NULL
	`,
})

export const UserSongsView = View({
	views: Views,
	view: "user_songs_view",
	dependencies: ["user_shares", "share_songs_view"],
	query: `
		SELECT 
			share_songs_view.*,
			user_shares.user_id_ref as user_id_ref
		FROM user_shares
		INNER JOIN share_songs_view ON user_shares.share_id_ref = share_songs_view.share_id_ref
	`,
})

export const ShareSongPlaysView = View({
	views: Views,
	view: "share_song_plays_view",
	dependencies: [],
	query: `
		SELECT share_id_ref, song_id_ref, COUNT(*)::integer as plays
		FROM song_plays
		GROUP BY share_id_ref, song_id_ref
	`,
})
