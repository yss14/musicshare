import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { Playlist } from "../models/PlaylistModel"
import { ISongService } from "./SongService"
import { IPlaylistDBResult, PlaylistsTable, SharePlaylistsTable, PlaylistSongsTable, Tables } from "../database/tables"
import { v4 as uuid } from "uuid"
import { ForbiddenError } from "apollo-server-core"
import { PlaylistSong } from "../models/PlaylistSongModel"
import { ViewDefinitions } from "../database/views"
import { uniqBy } from "lodash"

export type OrderUpdate = [string, number] | readonly [string, number]

export class PlaylistNotFoundError extends ForbiddenError {
	constructor(playlistID: string) {
		super(`Playlist with id ${playlistID} not found`)
	}
}

export type IPlaylistService = ReturnType<typeof PlaylistService>

interface IPlaylistServiceArgs {
	database: IDatabaseClient
	songService: ISongService
}

export const PlaylistService = ({ database }: IPlaylistServiceArgs) => {
	const getByID = async (shareID: string, playlistID: string) => {
		const playlists = await getPlaylistsForShare(shareID)

		const playlist = playlists.find((playlist) => playlist.id === playlistID)

		if (!playlist) {
			throw new PlaylistNotFoundError(playlistID)
		}

		return playlist
	}

	const create = async (shareID: string, name: string, id?: string) => {
		const playlistID = id || uuid()
		const playlistObj: IPlaylistDBResult = {
			playlist_id: playlistID,
			name,
			date_removed: null,
			date_added: new Date(),
		}

		await database.query(PlaylistsTable.insertFromObj(playlistObj))
		await database.query(
			SharePlaylistsTable.insertFromObj({
				share_id_ref: shareID,
				playlist_id_ref: playlistID,
				date_removed: null,
				date_added: new Date(),
			}),
		)

		return Playlist.fromDBResult(playlistObj, shareID)
	}

	const del = async (shareID: string, playlistID: string) => {
		await database.query(PlaylistsTable.update(["date_removed"], ["playlist_id"])([new Date()], [playlistID]))
	}

	const rename = async (shareID: string, playlistID: string, newName: string) => {
		await database.query(PlaylistsTable.update(["name"], ["playlist_id"])([newName], [playlistID]))
	}

	const addSongs = async (shareID: string, playlistID: string, songIDs: string[]) => {
		const currentSongs = await getSongs(playlistID)

		const insertQueries = songIDs.map((songID, idx) =>
			PlaylistSongsTable.insertFromObj({
				playlist_song_id: uuid(),
				playlist_id_ref: playlistID,
				song_id_ref: songID,
				date_removed: null,
				date_added: new Date(),
				position: currentSongs.length + idx + 1,
			}),
		)

		await database.batch(insertQueries)
	}

	const removeSongs = async (playlistID: string, playlistSongIDs: string[]) => {
		const deleteQuerys = playlistSongIDs.map((playlistSongID) => ({
			sql: `DELETE FROM ${PlaylistSongsTable.name} WHERE playlist_song_id = $1;`,
			values: [playlistSongID],
		}))

		await database.transaction(async (client) => {
			await Promise.all(deleteQuerys.map((query) => client.query(query)))
		})
		await normalizeSongOrder(playlistID)
	}

	const removeSongByID = async (playlistID: string, songID: string) => {
		await database.query(PlaylistSongsTable.delete(["playlist_id_ref", "song_id_ref"])([playlistID, songID]))
		await normalizeSongOrder(playlistID)
	}

	const normalizeSongOrder = async (playlistID: string) => {
		const songs = await getSongs(playlistID)
		const orderUpdates = songs.map((song, idx) => [song.playlistSongID, idx + 1] as const)

		await executeOrderUpdates(orderUpdates)
	}

	const getSongs = async (playlistID: string): Promise<PlaylistSong[]> => {
		const songQuery = SQL.raw<typeof ViewDefinitions.user_songs_view & typeof Tables.playlist_songs>(
			`
			WITH playlist_songs_with_duplicates AS (
				SELECT s.*, ps.*, COALESCE(ssp.plays, 0) as play_count
				FROM user_songs_view s
				INNER JOIN playlist_songs ps ON ps.song_id_ref = s.song_id
				INNER JOIN share_playlists sp ON sp.playlist_id_ref = ps.playlist_id_ref
				INNER JOIN user_shares us ON us.share_id_ref = sp.share_id_ref
				LEFT JOIN share_song_plays_view ssp ON ssp.share_id_ref = sp.share_id_ref AND ssp.song_id_ref = s.song_id
				WHERE ps.playlist_id_ref = $1 AND s.user_id_ref = us.user_id_ref
				ORDER BY ps.position ASC, s.song_id, (sp.share_id_ref = s.library_id_ref)::int ASC
			)

			SELECT /*DISTINCT ON (position, song_id)*/ * FROM playlist_songs_with_duplicates;
		`,
			[playlistID],
		)

		const songs = uniqBy(await database.query(songQuery), (row) => [row.song_id, row.position].join(" "))

		if (playlistID === "7d25fbd2-aaac-4730-b5a3-2e77e4166607") {
			//console.log(songs)
		}

		return songs.map((result) => PlaylistSong.fromDBResult(result))
	}

	const updateOrder = async (shareID: string, playlistID: string, orderUpdates: OrderUpdate[]) => {
		const currentSongs = await getSongs(playlistID)
		const playlistSongIDsSet = new Set(currentSongs.map((song) => song.playlistSongID))
		const someSongsIDsPartOfPlaylist = orderUpdates
			.map((orderUpdate) => orderUpdate[0])
			.some((playlistSongID) => !playlistSongIDsSet.has(playlistSongID))

		if (someSongsIDsPartOfPlaylist) {
			throw new Error(`Some songs are not part of this playlist`)
		}

		await executeOrderUpdates(orderUpdates)
	}

	const executeOrderUpdates = async (orderUpdates: OrderUpdate[]) => {
		const updateOrderQuery = PlaylistSongsTable.update(["position"], ["playlist_song_id"])
		const queries = orderUpdates.map((orderUpdate) => updateOrderQuery([orderUpdate[1]], [orderUpdate[0]]))

		await database.transaction(async (client) => {
			await Promise.all(queries.map((query) => client.query(query)))
		})
	}

	const getPlaylistsForShare = async (shareID: string): Promise<Playlist[]> => {
		const sharePlaylistQuery = SQL.raw<typeof Tables.playlists>(
			`
			SELECT p.* FROM ${PlaylistsTable.name} p
			INNER JOIN ${SharePlaylistsTable.name} sp ON sp.playlist_id_ref = p.playlist_id
			WHERE sp.share_id_ref = $1 AND p.date_removed IS NULL
			ORDER BY p.date_added;
		`,
			[shareID],
		)

		const playlists = await database.query(sharePlaylistQuery)

		return playlists
			.filter((playlist) => playlist.date_removed === null)
			.map((playlist) => Playlist.fromDBResult(playlist, shareID))
	}

	return {
		getByID,
		create,
		delete: del,
		rename,
		addSongs,
		removeSongs,
		removeSongByID,
		getSongs,
		updateOrder,
		getPlaylistsForShare,
	}
}
