import { Song } from '../models/SongModel';
import { IDatabaseClient, SQL, IDatabaseBaseClient } from 'postgres-schema-builder';
import { SongUpdateInput } from '../inputs/SongInput';
import * as snakeCaseObjKeys from 'snakecase-keys';
import moment = require('moment');
import { ISongDBResult, Tables, SongsTable, SharesTable, SongPlaysTable, ShareSongsTable, SongDBResultWithLibrary } from '../database/tables';
import { v4 as uuid } from 'uuid';
import { ForbiddenError, ValidationError } from 'apollo-server-core';
import { Share } from '../models/ShareModel';
import { uniqBy, flatten, take } from 'lodash'
import { SongSearchMatcher } from '../inputs/SongSearchInput';
import { IService, IServices, ServiceFactory } from './services';
import { SongIDUpdate } from '../return-types/SongIDUpdate';
import { isFileUpload } from '../models/FileSourceModels';

export class SongNotFoundError extends ForbiddenError {
	constructor(shareID: string, songID: string) {
		super(`Song with id ${songID} not found in share ${shareID}`);
	}
}

type ShareLike = Share | { id: string, isLibrary: boolean } | string;

const tokenizeQuery = (query: string) => query
	.trim()
	.toLowerCase()
	.replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g, '')
	.split(' ')
	.map(token => token.trim())
	.filter(token => token.length > 0)

const sqlFragements = {
	accessableShares: `
		WITH usershares as (
			SELECT DISTINCT user_shares.share_id_ref as share_id
			FROM user_shares, shares
			WHERE user_shares.user_id_ref = $1
				AND user_shares.share_id_ref = shares.share_id
				AND shares.date_removed IS NULL
		),
		relatedlibraries as (
			SELECT DISTINCT libraries.share_id
			FROM shares as libraries, user_shares us1, user_shares us2, usershares
			WHERE usershares.share_id = us1.share_id_ref
				AND us1.user_id_ref = us2.user_id_ref
				AND us2.share_id_ref = libraries.share_id
				AND libraries.date_removed IS NULL
		),
		accessibleshares as (
			SELECT * FROM usershares
			UNION DISTINCT
			SELECT * FROM relatedlibraries
		)`,
}

export type ISongService = ReturnType<typeof SongService>

export const SongService = (database: IDatabaseClient, services: ServiceFactory) => {

	const getByID = async (shareID: string, songID: string): Promise<Song> => {
		const dbResults = await database.query(
			SQL.raw<SongDBResultWithLibrary>(`
				SELECT s.*, l.share_id as library_id
				FROM ${SongsTable.name} s
				INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
				INNER JOIN share_songs sls ON sls.song_id_ref = ss.song_id_ref
				INNER JOIN shares l ON l.share_id = sls.share_id_ref
				WHERE s.song_id = $1 
					AND l.is_library = true 
					AND ss.share_id_ref = $2 
					AND s.date_removed IS NULL 
					AND ss.date_removed IS NULL;
			`, [songID, shareID])
		);

		if (dbResults.length === 0) {
			throw new SongNotFoundError(shareID, songID);
		}

		return Song.fromDBResult(dbResults[0]);
	}

	const getByShare = async (shareID: string): Promise<Song[]> => {
		const dbResults = await database.query(
			SQL.raw<SongDBResultWithLibrary>(`
					SELECT s.*, l.share_id as library_id
					FROM ${SongsTable.name} s
					INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
					INNER JOIN share_songs sls ON sls.song_id_ref = ss.song_id_ref
					INNER JOIN shares l ON l.share_id = sls.share_id_ref
					WHERE ss.share_id_ref = $1 
						AND l.is_library = true 
						AND s.date_removed IS NULL 
						AND ss.date_removed IS NULL;
			`, [shareID])
		)

		return dbResults.map(Song.fromDBResult)
	}

	const getSongOriginLibrary = async (songID: string): Promise<Share | null> => {
		throw 'getSongOriginLibrary() not implemented yet'
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(`
				SELECT libraries.*
				FROM ${SongsTable.name} s
				INNER JOIN ${SharesTable.name} libraries ON libraries.share_id = s.share_id_ref
				WHERE s.song_id = $1
					AND libraries.date_removed IS NULL 
					AND s.date_removed IS NULL;
			`, [songID])
		)

		if (dbResults.length > 0) {
			return Share.fromDBResult(dbResults[0]);
		} else {
			return null;
		}
	}

	const hasAccessToSongs = async (userID: string, songIDs: string[]): Promise<boolean> => {
		throw 'hasAccessToSongs() not implemented yet'
		const dbResults = await database.query(
			SQL.raw<typeof Tables.songs>(`
				${sqlFragements.accessableShares}
				SELECT DISTINCT songs.song_id
				FROM songs, accessibleshares
				WHERE songs.share_id_ref = accessibleshares.share_id
					AND songs.date_removed IS NULL;
			
			`, [userID])
		)

		const accessibleSongIDs = new Set(dbResults.map(result => result.song_id))

		return songIDs.every(songID => accessibleSongIDs.has(songID))
	}

	const getByShareDirty = async (shareID: string, lastTimestamp: number): Promise<Song[]> => {
		const songs = await getByShare(shareID);

		return songs.filter(song => moment(song.dateLastEdit).valueOf() > lastTimestamp); // TODO do via SQL query
	}

	const create = async (libraryID: string, song: ISongDBResult): Promise<string> => {
		// istanbul ignore next
		let songID = song.song_id || uuid();
		const sources = { data: song.sources.data || [] };

		const insertSongTableQuery = SongsTable.insertFromObj({ ...song, sources: sources })
		const insertShareSongsTableQuery = ShareSongsTable.insertFromObj({
			share_id_ref: libraryID,
			song_id_ref: songID,
		})

		await database.transaction(async (transaction) => {
			await transaction.query(insertSongTableQuery)
			await transaction.query(insertShareSongsTableQuery)

			await propagateNewSong(libraryID, songID, transaction)
		})

		return songID
	}

	const propagateNewSong = async (libraryID: string, songID: string, transaction: IDatabaseBaseClient) => {
		const { shareService } = services()

		const linkedLibraryShares = await shareService.getLinkedShares(libraryID)

		await Promise.all(linkedLibraryShares.map(share => transaction.query(
			ShareSongsTable.insertFromObj({
				share_id_ref: share.id,
				song_id_ref: songID,
			})
		)))
	}

	const update = async (shareID: string, songID: string, song: SongUpdateInput): Promise<void> => {
		const baseSong: Partial<ISongDBResult> = {
			...snakeCaseObjKeys(song as any),
			date_last_edit: new Date(),
		}

		await updateShareSong(shareID, songID, baseSong);
	}

	const updateShareSong = async (shareID: string, songID: string, baseSong: Partial<ISongDBResult>) => {
		await database.query(
			SongsTable.update(Object.keys(baseSong) as any, ['song_id'])
				(Object.values(baseSong), [songID])
		);
	}

	const searchSongs = async (userID: string, query: string, matchers: SongSearchMatcher[], limit: number = 20): Promise<Song[]> => {
		const tokenizedQuery = tokenizeQuery(query)

		if (tokenizedQuery.length === 0) {
			throw new ValidationError('Search query is empty. Only special chars are not a valid search query.')
		}

		const finalMatchers = flatten(
			matchers.map(matcher => {
				switch (matcher) {
					case SongSearchMatcher.Title: return [matcher, 'type']
					case SongSearchMatcher.Artists: return [matcher, 'remixer', 'featurings']
					default: return matcher
				}
			})
		)
		const columnNames = flatten(
			finalMatchers.map(columnName => {
				switch (columnName) {
					case SongSearchMatcher.Title:
					case 'type': return [columnName, 'type']
					default: return `${columnName}_flatten`
				}
			})
		)

		const mapColumnToCondition = (columnName: string) => tokenizedQuery.map(token => `lower(${columnName}) LIKE '%${token}%'`)
		const mapColumnToTokenizedQuery = (columnName: string) => `(
			${mapColumnToCondition(columnName)
				.join(' OR ')}
		)`
		const unnestStatements = finalMatchers
			.filter(columnName => columnName !== 'title' && columnName !== 'type')
			.map(columnName => `LEFT JOIN LATERAL unnest(${columnName}) as ${columnName}_flatten ON true`).join('\n')
		const where = columnNames.map(mapColumnToTokenizedQuery).join(' OR ')

		const sql = `
			${sqlFragements.accessableShares}
			SELECT DISTINCT ON (songs.song_id) songs.*
			FROM songs, accessibleshares
			${unnestStatements}
			WHERE songs.share_id_ref = accessibleshares.share_id
				AND songs.date_removed IS NULL
				AND (${where});
		`

		const dbResults = await database.query(
			SQL.raw<typeof Tables.songs>(sql, [userID])
		)

		const sum = (acc: number, value: number) => acc + value
		const containmentScores: { [key: string]: number } = dbResults.reduce((dict, result) => {
			let score = 0

			for (const matcher of finalMatchers) {
				for (const token of tokenizedQuery) {
					const value = result[matcher]

					if (Array.isArray(value)) {
						score += value.map(val => Number(val.toLowerCase().indexOf(token) > -1 ? 1 : 0))
							.reduce(sum, 0)
					} else if (typeof value === 'string' && value.toLowerCase().indexOf(token) > -1) {
						score += 1
					}
				}
			}

			dict[result.song_id] = score

			return dict
		}, {})

		return take(
			dbResults
				.map(result => Song.fromDBResult(result as any))
				.sort((lhs, rhs) => containmentScores[rhs.id] - containmentScores[lhs.id])
			, limit // cannot use limit in sql query because scoring happens in code
		)
	}

	const removeSongFromLibrary = async (libraryID: string, songID: string): Promise<SongIDUpdate[]> => {
		const { shareService } = services()

		const affectedPlaylists = await database.query(
			SQL.raw<typeof Tables.playlists & typeof Tables.shares>(`
				SELECT playlists.playlist_id, playlists.name, shares.share_id, shares.is_library
				FROM playlists
				INNER JOIN playlist_songs ps ON playlists.playlist_id = ps.playlist_id_ref
				INNER JOIN share_playlists sp ON playlists.playlist_id = sp.playlist_id_ref
				INNER JOIN shares ON shares.share_id = sp.share_id_ref
				WHERE ps.song_id_ref = $1
					AND playlists.date_removed IS NULL
					AND shares.date_removed IS NULL;
			`, [songID])
		)
		const affectedForeignPlaylists = affectedPlaylists.filter(result => result.share_id !== libraryID)
		const affectedLibraryPlaylists = affectedForeignPlaylists.filter(result => result.is_library)
		const affectedSharePlaylists = affectedForeignPlaylists.filter(result => !result.is_library)

		// copy songs to affected libraries and update playlists of those libraries
		const songResult = (await database.query(SongsTable.select('*', ['song_id'])([songID])))[0]
		const affectedLibraryIDs = new Set(affectedLibraryPlaylists.map(result => result.share_id))

		const copiedSongLibraryMappings = new Map<string, string>()

		for (const affectedLibraryID of affectedLibraryIDs) {
			const newSongID = uuid()
			await create(affectedLibraryID, {
				...songResult,
				song_id: newSongID,
				sources: {
					data: songResult.sources.data.filter(source => !isFileUpload(source)),
				}
			})

			const playlistIDs = new Set(
				affectedLibraryPlaylists.filter(result => result.share_id === affectedLibraryID)
					.map(result => result.playlist_id)
			)

			for (const playlistID of playlistIDs) {
				await database.query(SQL.raw(`
					UPDATE playlist_songs SET song_id_ref = $1 WHERE playlist_id_ref = $2 AND song_id_ref = $3;
				`, [newSongID, playlistID, songID]))
			}

			copiedSongLibraryMappings.set(affectedLibraryID, newSongID)
		}

		// try to find a referencing library which has this song and update songID to new songID
		const songIDUpdates: SongIDUpdate[] = []

		for (const affectedSharePlaylist of affectedSharePlaylists) {
			const linkedLibrariesOfShare = await shareService.getLinkedLibrariesOfShare(affectedSharePlaylist.share_id)
			const linkedLibraryWithSong = linkedLibrariesOfShare.find(linkedLibrary => affectedLibraryIDs.has(linkedLibrary.id))

			if (!linkedLibraryWithSong) continue

			const newSongID = copiedSongLibraryMappings.get(linkedLibraryWithSong.id)

			if (!newSongID) continue

			await database.query(SQL.raw(`
					UPDATE playlist_songs SET song_id_ref = $1 WHERE playlist_id_ref = $2 AND song_id_ref = $3;
				`, [newSongID, affectedSharePlaylist.playlist_id, songID]))

			songIDUpdates.push(
				SongIDUpdate.create(
					affectedSharePlaylist.share_id,
					affectedSharePlaylist.playlist_id,
					songID,
					newSongID,
					linkedLibraryWithSong.id
				)
			)
		}

		await database.query(
			SongsTable.update(['date_removed'], ['song_id'])([new Date()], [songID])
		)

		return songIDUpdates
	}

	const increasePlayCount = async (shareID: string, songID: string, userID: string) => {
		const insertPlayQuery = SongPlaysTable.insertFromObj({
			song_id_ref: songID,
			user_id_ref: userID,
			share_id_ref: shareID,
		})

		await database.query(insertPlayQuery)
	}

	return {
		getByID,
		getByShare,
		getSongOriginLibrary,
		hasAccessToSongs,
		getByShareDirty,
		create,
		update,
		searchSongs,
		removeSongFromLibrary,
		increasePlayCount,
	}
}