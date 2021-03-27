import { Permission, Permissions } from "@musicshare/shared-types"
import { Share } from "../models/ShareModel"
import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { Tables, SharesTable, UserSharesTable, SongsTable } from "../database/tables"
import { v4 as uuid } from "uuid"
import { ForbiddenError } from "apollo-server-core"
import { ServiceFactory } from "./services"
import { isFileUpload } from "../models/FileSourceModels"
import { IConfig } from "../types/config"
import { ShareQuota } from "../models/ShareQuotaModel"

export class ShareNotFoundError extends ForbiddenError {
	constructor(shareID: string) {
		super(`Share with id ${shareID} not found`)
	}
}

export type IShareService = ReturnType<typeof ShareService>

export const ShareService = (database: IDatabaseClient, services: ServiceFactory, config: IConfig) => {
	const getSharesOfUser = async (userID: string): Promise<Share[]> => {
		const userSharesQuery = SQL.raw<typeof Tables.shares>(
			`
			SELECT s.* 
			FROM ${SharesTable.name} s
			INNER JOIN ${UserSharesTable.name} us ON us.share_id_ref = s.share_id
			WHERE us.user_id_ref = $1 AND s.date_removed IS NULL
			ORDER BY s.date_added;
		`,
			[userID],
		)

		const dbResults = await database.query(userSharesQuery)

		return dbResults.map(Share.fromDBResult)
	}

	const getUserLibrary = async (userID: string) => {
		const userShares = await getSharesOfUser(userID)
		const library = userShares.find((share) => share.isLibrary === true)

		return library!
	}

	const getShareByID = async (shareID: string, userID: string): Promise<Share> => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(
				`
			SELECT s.* FROM ${SharesTable.name} s
			INNER JOIN ${UserSharesTable.name} us ON us.share_id_ref = s.share_id
			WHERE s.share_id = $1 AND us.user_id_ref = $2 AND s.date_removed IS NULL;
		`,
				[shareID, userID],
			),
		)

		if (!dbResults || dbResults.length === 0) {
			throw new ShareNotFoundError(shareID)
		}

		return Share.fromDBResult(dbResults[0])
	}

	// TODO check if still necessary after refactoring
	const getLinkedLibrariesOfUser = async (userID: string): Promise<Share[]> => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(
				`
				WITH usershares as (
					SELECT DISTINCT user_shares.share_id_ref as share_id
					FROM user_shares, shares
					WHERE user_shares.user_id_ref = $1
						AND user_shares.share_id_ref = shares.share_id
						AND shares.date_removed IS NULL
				),
				relatedlibraries as (
					SELECT DISTINCT libraries.*
					FROM shares as libraries, user_shares us1, user_shares us2, usershares
					WHERE usershares.share_id = us1.share_id_ref
						AND us1.user_id_ref = us2.user_id_ref
						AND us2.share_id_ref = libraries.share_id
						AND libraries.date_removed IS NULL
						AND libraries.is_library = true
				)
				SELECT * FROM relatedlibraries;
			`,
				[userID],
			),
		)

		return dbResults.map(Share.fromDBResult)
	}

	const getLinkedLibrariesOfShare = async (shareID: string): Promise<Share[]> => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(
				`
				SELECT l.*
				FROM shares s
				INNER JOIN user_shares us1 ON us1.share_id_ref = s.share_id
				INNER JOIN user_shares us2 ON us1.user_id_ref = us2.user_id_ref
				INNER JOIN shares l ON l.share_id = us2.share_id_ref
				WHERE s.date_removed IS NULL
					AND l.date_removed IS NULL
					AND l.is_library = true
					AND s.share_id = $1;
			`,
				[shareID],
			),
		)

		return dbResults.map(Share.fromDBResult)
	}

	const getLinkedShares = async (libraryID: string) => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(
				`
				SELECT s.*
				FROM shares s
				INNER JOIN user_shares us1 ON us1.share_id_ref = s.share_id
				INNER JOIN user_shares us2 ON us1.user_id_ref = us2.user_id_ref
				INNER JOIN shares l ON l.share_id = us2.share_id_ref
				WHERE s.date_removed IS NULL
					AND l.date_removed IS NULL
					AND s.is_library = false
					AND l.share_id = $1;
			`,
				[libraryID],
			),
		)

		return dbResults.map(Share.fromDBResult)
	}

	const create = async (ownerUserID: string, name: string, isLib: boolean, shareID?: string): Promise<Share> => {
		const id = shareID || uuid()
		const date = new Date()

		await database.query(
			SharesTable.insertFromObj({
				share_id: id,
				name,
				date_added: date,
				is_library: isLib,
				date_removed: null,
				quota: config.setup.shareQuota,
				quota_used: 0,
			}),
		)
		await addUserToShare(id, ownerUserID, Permissions.ALL)

		return Share.fromDBResult({
			share_id: id,
			name: name,
			is_library: true,
			date_added: date,
			date_removed: null,
			quota: config.setup.shareQuota,
			quota_used: 0,
		})
	}

	const addUser = async (shareID: string, userID: string, permissions: Permission[]): Promise<void> => {
		return addUserToShare(shareID, userID, permissions)
	}

	const addUserToShare = async (shareID: string, userID: string, permissions: string[]) => {
		await database.query(
			UserSharesTable.insertFromObj({
				user_id_ref: userID,
				share_id_ref: shareID,
				permissions,
				date_added: new Date(),
				date_removed: null,
			}),
		)
	}

	const removeUser = async (shareID: string, userID: string): Promise<void> => {
		const { songService } = services()
		// 1. find all songs of users lib which are referenced in library playlists linked to this share
		// 2. group by library, group by song
		// copy each song and update playlist reference
		// remove all references from share playlists
		// remove all references from other libraries

		const leavingUserLibrary = (await getSharesOfUser(userID)).find((share) => share.isLibrary === true)!
		const linkedLibraries = await getLinkedLibrariesOfShare(shareID)
		const linkedLibrariesIDs = linkedLibraries.map((library) => library.id)

		const affectedPlaylistSongs = await database.query(
			SQL.raw<typeof Tables.playlist_songs & typeof Tables.share_playlists>(
				`
				SELECT DISTINCT ON (sp.share_id_ref, s.song_id) ps.*, sp.share_id_ref
				FROM playlist_songs ps
				INNER JOIN playlists p ON ps.playlist_id_ref = p.playlist_id
				INNER JOIN user_songs_view as s ON s.song_id = ps.song_id_ref
				INNER JOIN share_playlists sp ON sp.playlist_id_ref = ps.playlist_id_ref
				INNER JOIN user_shares us ON us.share_id_ref = sp.share_id_ref
				WHERE sp.share_id_ref = ANY($1)
					AND s.library_id_ref = $2
					AND s.user_id_ref = us.user_id_ref
					AND p.date_removed IS NULL

				UNION

				SELECT DISTINCT ON (sp.share_id_ref, s.song_id) ps.*, sp.share_id_ref
				FROM playlist_songs ps
				INNER JOIN playlists p ON ps.playlist_id_ref = p.playlist_id
				INNER JOIN user_songs_view as s ON s.song_id = ps.song_id_ref
				INNER JOIN share_playlists sp ON sp.playlist_id_ref = ps.playlist_id_ref
				INNER JOIN user_shares us ON us.share_id_ref = sp.share_id_ref
				WHERE sp.share_id_ref = $2
					AND s.library_id_ref != $2
					AND s.user_id_ref = us.user_id_ref
					AND p.date_removed IS NULL
			`,
				[linkedLibrariesIDs.filter((id) => id !== leavingUserLibrary.id), leavingUserLibrary.id],
			),
		)

		const libraryIDs = new Set(affectedPlaylistSongs.map((row) => row.share_id_ref))

		// copy affected playlist songs to corresponding libraries and replace reference in playlist_songs
		for (const libraryID of libraryIDs) {
			const libraryPlaylistSongs = new Set(
				affectedPlaylistSongs.filter((row) => row.share_id_ref === libraryID).map((row) => row.song_id_ref),
			)

			for (const songID of libraryPlaylistSongs) {
				const songResult = (await database.query(SongsTable.select("*", ["song_id"])([songID])))[0]

				const newSongID = uuid()
				await songService.create(libraryID, {
					...songResult,
					song_id: newSongID,
					sources: {
						data: songResult.sources.data.filter((source) => !isFileUpload(source)),
					},
				})

				await database.query(
					SQL.raw(
						`
						UPDATE playlist_songs ps
						SET song_id_ref = $1 
						FROM share_playlists sp
						WHERE ps.song_id_ref = $2 AND ps.playlist_id_ref = sp.playlist_id_ref AND sp.share_id_ref = $3;
					`,
						[newSongID, songID, libraryID],
					),
				)
			}
		}

		// remove songs from remaining share playlists which belong to the leaving users library
		const librarySongs = await songService.getByShare(leavingUserLibrary.id)
		const librarySongIDs = Array.from(new Set(librarySongs.map((song) => song.id)))

		await database.query(
			SQL.raw(
				`
				DELETE FROM playlist_songs ps
				USING share_playlists sp
				WHERE ps.playlist_id_ref = sp.playlist_id_ref AND sp.share_id_ref = $1 AND ps.song_id_ref = ANY($2);
			`,
				[shareID, librarySongIDs],
			),
		)

		// remove leaving user from share
		await database.query(UserSharesTable.delete(["share_id_ref", "user_id_ref"])([shareID, userID]))

		// remove all songs in users playlists referenced from other libraries
		const sql = `
			WITH song_of_my_library as (
				SELECT s.song_id 
				FROM songs s
				WHERE s.library_id_ref = $1 AND s.date_removed IS NULL
			)

			DELETE FROM playlist_songs ps
			USING share_playlists sp
			WHERE ps.playlist_id_ref = sp.playlist_id_ref AND sp.share_id_ref = $1 AND ps.song_id_ref NOT IN (SELECT * FROM song_of_my_library);
		`
		await database.query(SQL.raw(sql, [leavingUserLibrary.id]))
	}

	const rename = async (shareID: string, name: string): Promise<void> => {
		await database.query(SharesTable.update(["name"], ["share_id"])([name], [shareID]))
	}

	const remove = async (shareID: string): Promise<void> => {
		await database.query(SharesTable.update(["date_removed"], ["share_id"])([new Date()], [shareID]))
	}

	const getQuota = async (shareID: string) => {
		const dbResults = await database.query(SharesTable.select("*", ["share_id"])([shareID]))

		if (!dbResults || dbResults.length === 0 || dbResults[0].date_removed !== null) {
			throw new ShareNotFoundError(shareID)
		}

		return ShareQuota.fromDBResult(dbResults[0])
	}

	const adjustQuotaUsed = async (libraryID: string, amount: number) => {
		await database.query(
			SQL.raw(`UPDATE shares SET quota_used = quota_used + $1 WHERE share_id = $2;`, [amount, libraryID]),
		)
	}

	return {
		getSharesOfUser,
		getUserLibrary,
		getShareByID,
		getLinkedLibrariesOfUser,
		getLinkedShares,
		create,
		addUser,
		removeUser,
		rename,
		remove,
		getQuota,
		adjustQuotaUsed,
	}
}
