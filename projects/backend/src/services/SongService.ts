import { ShareSong } from "../models/SongModel"
import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { SongUpdateInput } from "../inputs/SongInput"
import snakeCaseObjKeys from "snakecase-keys"
import moment from "moment"
import { ISongDBResult, Tables, SongsTable, SongPlaysTable } from "../database/tables"
import { v4 as uuid } from "uuid"
import { ForbiddenError, ValidationError } from "apollo-server-core"
import { flatten, take } from "lodash"
import { SongSearchMatcher } from "../inputs/SongSearchInput"
import { ServiceFactory } from "./services"
import { isFileUpload } from "../models/FileSourceModels"
import stringSimilarity from "string-similarity"
import { buildSongName } from "@musicshare/shared-types"
import { Views } from "../database/views"

export class SongNotFoundError extends ForbiddenError {
	constructor(shareID: string, songID: string) {
		super(`Song with id ${songID} not found in share ${shareID}`)
	}
}

const tokenizeQuery = (query: string) =>
	query
		.trim()
		.toLowerCase()
		.replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g, "")
		.split(" ")
		.map((token) => token.trim())
		.filter((token) => token.length > 0)

export type ISongService = ReturnType<typeof SongService>

export const SongService = (database: IDatabaseClient, services: ServiceFactory) => {
	const getByID = async (shareID: string, songID: string): Promise<ShareSong> => {
		const dbResults = await database.query(
			// TODO playcount
			SQL.raw<typeof Views.share_songs_view>(
				`
				SELECT s.*, 0 as play_count
				FROM share_songs_view s
				WHERE s.song_id = $1 
					AND s.share_id_ref = $2;
			`,
				[songID, shareID],
			),
		)

		if (dbResults.length === 0) {
			throw new SongNotFoundError(shareID, songID)
		}

		return ShareSong.fromDBResult(dbResults[0])
	}

	const getByShare = async (shareID: string): Promise<ShareSong[]> => {
		const dbResults = await database.query(
			SQL.raw<typeof Views.share_songs_view>(
				`
					SELECT s.*, 0 as play_count
					FROM share_songs_view s
					WHERE s.share_id_ref = $1;
			`,
				[shareID],
			),
		)

		return dbResults.map(ShareSong.fromDBResult)
	}

	const hasReadAccessToSongs = async (userID: string, songIDs: string[]): Promise<boolean> => {
		const dbResults = await database.query(
			SQL.raw<typeof Views.user_songs_view>(
				`
				SELECT *
				FROM user_songs_view
				WHERE user_id_ref = $1
					AND song_id = ANY($2);
			`,
				[userID, songIDs],
			),
		)

		const accessibleSongIDs = new Set(dbResults.map((result) => result.song_id))

		return songIDs.every((songID) => accessibleSongIDs.has(songID))
	}

	const hasWriteAccessToSongs = async (userID: string, songIDs: string[]): Promise<boolean> => {
		const dbResults = await database.query(
			SQL.raw<typeof Views.share_songs_view>(
				`
				SELECT ss.*
				FROM shares l
				INNER JOIN user_shares us ON us.share_id_ref = l.share_id
				INNER JOIN share_songs_view ss ON ss.share_id_ref = l.share_id
				WHERE us.user_id_ref = $1
					AND l.date_removed IS NULL
					AND l.is_library = true
					AND ss.song_id = ANY($2)
			`,
				[userID, songIDs],
			),
		)

		const accessibleSongIDs = new Set(dbResults.map((result) => result.song_id))

		return songIDs.every((songID) => accessibleSongIDs.has(songID))
	}

	const getByShareDirty = async (shareID: string, lastTimestamp: number): Promise<ShareSong[]> => {
		const songs = await getByShare(shareID)

		return songs.filter((song) => moment(song.dateLastEdit).valueOf() > lastTimestamp) // TODO do via SQL query
	}

	// TODO libraryID still required?
	const create = async (libraryID: string, song: ISongDBResult): Promise<string> => {
		// istanbul ignore next
		let songID = song.song_id || uuid()
		const sources = { data: song.sources.data || [] }

		const insertSongTableQuery = SongsTable.insertFromObj({ ...song, sources: sources, library_id_ref: libraryID })

		await database.query(insertSongTableQuery)

		return songID
	}

	const update = async (songID: string, song: SongUpdateInput): Promise<void> => {
		const baseSong: Partial<ISongDBResult> = {
			...snakeCaseObjKeys(song as any),
			date_last_edit: new Date(),
		}

		await updateShareSong(songID, baseSong)
	}

	const updateShareSong = async (songID: string, baseSong: Partial<ISongDBResult>) => {
		await database.query(
			SongsTable.update(Object.keys(baseSong) as any, ["song_id"])(Object.values(baseSong), [songID]),
		)
	}

	const searchSongs = async (
		userID: string,
		query: string,
		matchers: SongSearchMatcher[],
		limit: number = 20,
	): Promise<ShareSong[]> => {
		const tokenizedQuery = tokenizeQuery(query)

		if (tokenizedQuery.length === 0) {
			throw new ValidationError("Search query is empty. Only special chars are not a valid search query.")
		}

		const finalMatchers = flatten(
			matchers.map((matcher) => {
				switch (matcher) {
					case SongSearchMatcher.Title:
						return [matcher, "type"]
					case SongSearchMatcher.Artists:
						return [matcher, "remixer", "featurings"]
					default:
						return matcher
				}
			}),
		)
		const columnNames = flatten(
			finalMatchers.map((columnName) => {
				switch (columnName) {
					case SongSearchMatcher.Title:
					case "type":
						return [columnName, "type"]
					default:
						return `${columnName}_flatten`
				}
			}),
		)

		const mapColumnToCondition = (columnName: string) =>
			tokenizedQuery.map((token) => `lower(${columnName}) LIKE '%${token}%'`)
		const mapColumnToTokenizedQuery = (columnName: string) => `(
			${mapColumnToCondition(columnName).join(" OR ")}
		)`
		const unnestStatements = finalMatchers
			.filter((columnName) => columnName !== "title" && columnName !== "type")
			.map((columnName) => `LEFT JOIN LATERAL unnest(${columnName}) as ${columnName}_flatten ON true`)
			.join("\n")
		const where = columnNames.map(mapColumnToTokenizedQuery).join(" OR ")

		// TODO playcount
		const sql = `
			SELECT DISTINCT ON (s.song_id) s.*, 0 as play_count
			FROM user_songs_view s
			${unnestStatements}
			WHERE s.user_id_ref = $1
				AND (${where});
		`

		const dbResults = await database.query(
			SQL.raw<typeof Views.user_songs_view>(sql, [userID]),
		)

		const sum = (acc: number, value: number) => acc + value
		const containmentScores: { [key: string]: number } = dbResults.reduce((dict, result) => {
			let score = 0

			for (const matcher of finalMatchers) {
				for (const token of tokenizedQuery) {
					const value = result[matcher]

					if (Array.isArray(value)) {
						score += value
							.map((val) => Number(val.toLowerCase().indexOf(token) > -1 ? 1 : 0))
							.reduce(sum, 0)
					} else if (typeof value === "string" && value.toLowerCase().indexOf(token) > -1) {
						score += 1
					}
				}
			}

			dict[result.song_id] = score

			return dict
		}, {})

		return take(
			dbResults
				.map((result) => ShareSong.fromDBResult(result))
				.sort((lhs, rhs) => containmentScores[rhs.id] - containmentScores[lhs.id]),
			limit, // cannot use limit in sql query because scoring happens in code
		)
	}

	const removeSongFromLibrary = async (libraryID: string, songID: string) => {
		const { playlistService, shareService, songFileService } = services()

		const affectedPlaylists = await database.query(
			SQL.raw<typeof Tables.playlists & typeof Tables.shares>(
				`
				SELECT playlists.playlist_id, playlists.name, shares.share_id, shares.is_library
				FROM playlists
				INNER JOIN playlist_songs ps ON playlists.playlist_id = ps.playlist_id_ref
				INNER JOIN share_playlists sp ON playlists.playlist_id = sp.playlist_id_ref
				INNER JOIN shares ON shares.share_id = sp.share_id_ref
				WHERE ps.song_id_ref = $1
					AND playlists.date_removed IS NULL
					AND shares.date_removed IS NULL;
			`,
				[songID],
			),
		)
		const affectedLibraryPlaylists = affectedPlaylists.filter((result) => result.share_id === libraryID)
		const affectedForeignPlaylists = affectedPlaylists.filter((result) => result.share_id !== libraryID)
		const affectedForeignLibraryPlaylists = affectedForeignPlaylists.filter((result) => result.is_library)
		const affectedSharePlaylists = affectedForeignPlaylists.filter((result) => !result.is_library)

		// copy songs to affected libraries and update playlists of those libraries
		const songResult = (await database.query(SongsTable.select("*", ["song_id"])([songID])))[0]
		const affectedLibraryIDs = new Set(affectedForeignLibraryPlaylists.map((result) => result.share_id))

		const copiedSongLibraryMappings = new Map<string, string>()

		for (const affectedLibraryID of affectedLibraryIDs) {
			const newSongID = uuid()
			await create(affectedLibraryID, {
				...songResult,
				song_id: newSongID,
				sources: {
					data: songResult.sources.data.filter((source) => !isFileUpload(source)),
				},
			})

			const playlistIDs = new Set(
				affectedForeignLibraryPlaylists
					.filter((result) => result.share_id === affectedLibraryID)
					.map((result) => result.playlist_id),
			)

			for (const playlistID of playlistIDs) {
				await database.query(
					SQL.raw(
						`
					UPDATE playlist_songs SET song_id_ref = $1 WHERE playlist_id_ref = $2 AND song_id_ref = $3;
				`,
						[newSongID, playlistID, songID],
					),
				)
			}

			copiedSongLibraryMappings.set(affectedLibraryID, newSongID)
		}

		for (const sharePlaylist of affectedSharePlaylists) {
			await playlistService.removeSongByID(sharePlaylist.playlist_id, songID)
		}
		for (const libraryPlaylist of affectedLibraryPlaylists) {
			await playlistService.removeSongByID(libraryPlaylist.playlist_id, songID)
		}

		await database.query(SongsTable.update(["date_removed"], ["song_id"])([new Date()], [songID]))

		const fileDataSources = songResult.sources.data.filter((source) => isFileUpload(source))
		for (const fileDataSource of fileDataSources) {
			await shareService.adjustQuotaUsed(libraryID, fileDataSource.fileSize)
			await songFileService.removeFile(fileDataSource.blob)
		}
	}

	const increasePlayCount = async (shareID: string, songID: string, userID: string) => {
		const insertPlayQuery = SongPlaysTable.insertFromObj({
			song_id_ref: songID,
			user_id_ref: userID,
			share_id_ref: shareID,
		})

		await database.query(insertPlayQuery)
	}

	const findSongFileDuplicates = async (userID: string, hash: string): Promise<ShareSong[]> => {
		const sql = `
			SELECT DISTINCT ON (s.song_id) s.*
			FROM user_songs_view s
			LEFT JOIN LATERAL json_array_elements(s.sources -> 'data') as song_source ON true
			WHERE s.user_id_ref = $1
				AND song_source ->> 'hash' = $2;
		`
		const query = SQL.raw<typeof Views.user_songs_view>(sql, [userID, hash])

		const dbResults = await database.query(query)

		return dbResults.map((result) => ShareSong.fromDBResult(result))
	}

	const findNearDuplicateSongs = async (
		userID: string,
		title: string,
		artist: string,
		threshold: number,
	): Promise<ShareSong[]> => {
		const allSongsDBResult = await database.query(
			SQL.raw<typeof Views.user_songs_view>(
				`
			SELECT DISTINCT ON (s.song_id) s.*
			FROM user_songs_view s
			WHERE s.user_id_ref = $1;
		`,
				[userID],
			),
		)
		const allSongs = allSongsDBResult.map((result) => ShareSong.fromDBResult(result))

		const nearDuplicates = allSongs.filter((song) => {
			const similarity = stringSimilarity.compareTwoStrings(
				`${title} ${artist}`,
				buildSongName(song as any) + " " + song.artists.join(", "),
			)

			return similarity >= threshold
		})

		return nearDuplicates
	}

	return {
		getByID,
		getByShare,
		hasReadAccessToSongs,
		hasWriteAccessToSongs,
		getByShareDirty,
		create,
		update,
		searchSongs,
		removeSongFromLibrary,
		increasePlayCount,
		findSongFileDuplicates,
		findNearDuplicateSongs,
	}
}
