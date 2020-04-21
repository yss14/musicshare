import { IDatabaseClient, SQL } from "postgres-schema-builder";
import { Playlist } from "../models/PlaylistModel";
import { ISongService } from "./SongService";
import { IPlaylistDBResult, PlaylistsTable, SharePlaylistsTable, PlaylistSongsTable, SongsTable, Tables, SongDBResultWithLibrary } from "../database/tables";
import { v4 as uuid } from 'uuid';
import { ForbiddenError } from "apollo-server-core";
import { PlaylistSong } from "../models/PlaylistSongModel";

export type OrderUpdate = [string, number] | readonly [string, number];

export class PlaylistNotFoundError extends ForbiddenError {
	constructor(playlistID: string) {
		super(`Playlist with id ${playlistID} not found`);
	}
}

export type IPlaylistService = ReturnType<typeof PlaylistService>

interface IPlaylistServiceArgs {
	database: IDatabaseClient;
	songService: ISongService;
}

export const PlaylistService = ({ database, songService }: IPlaylistServiceArgs) => {
	const getByID = async (shareID: string, playlistID: string) => {
		const playlists = await getPlaylistsForShare(shareID);

		const playlist = playlists.find(playlist => playlist.id === playlistID);

		if (!playlist) {
			throw new PlaylistNotFoundError(playlistID);
		}

		return playlist;
	}

	const create = async (shareID: string, name: string, id?: string) => {
		const playlistID = id || uuid();
		const playlistObj: IPlaylistDBResult = {
			playlist_id: playlistID,
			name,
			date_removed: null,
			date_added: new Date(),
		};

		await database.query(PlaylistsTable.insertFromObj(playlistObj));
		await database.query(SharePlaylistsTable.insertFromObj({
			share_id_ref: shareID,
			playlist_id_ref: playlistID,
			date_removed: null,
			date_added: new Date(),
		}));

		return Playlist.fromDBResult(playlistObj, shareID);
	};

	const del = async (shareID: string, playlistID: string) => {
		await database.query(
			PlaylistsTable.update(['date_removed'], ['playlist_id'])
				([new Date()], [playlistID])
		);
	};

	const rename = async (shareID: string, playlistID: string, newName: string) => {
		await database.query(
			PlaylistsTable.update(['name'], ['playlist_id'])
				([newName], [playlistID])
		);
	};

	const addSongs = async (shareID: string, playlistID: string, songIDs: string[]) => {
		const currentSongs = await getSongs(playlistID);

		const insertQueries = songIDs
			.map((songID, idx) => PlaylistSongsTable.insertFromObj({
				playlist_song_id: uuid(),
				playlist_id_ref: playlistID,
				song_id_ref: songID,
				date_removed: null,
				date_added: new Date(),
				position: currentSongs.length + idx + 1
			}));

		await database.batch(insertQueries);
	};

	const removeSongs = async (playlistID: string, playlistSongIDs: string[]) => {
		const deleteQuerys = playlistSongIDs.map(playlistSongID => ({
			sql: `DELETE FROM ${PlaylistSongsTable.name} WHERE playlist_song_id = $1;`,
			values: [playlistSongID],
		}));

		await database.transaction(async (client) => {
			await Promise.all(deleteQuerys.map(query => client.query(query)))
		})
		await normalizeSongOrder(playlistID)
	}

	const removeSongByID = async (playlistID: string, songID: string) => {
		await database.query(
			PlaylistSongsTable.delete(['playlist_id_ref', 'song_id_ref'])([playlistID, songID])
		)
		await normalizeSongOrder(playlistID)
	}

	const normalizeSongOrder = async (playlistID: string) => {
		const songs = await getSongs(playlistID)
		const orderUpdates = songs.map((song, idx) => [song.playlistSongID, idx] as const)

		await executeOrderUpdates(orderUpdates)
	}

	const getSongs = async (playlistID: string): Promise<PlaylistSong[]> => {
		const songQuery = SQL.raw<SongDBResultWithLibrary & typeof Tables.playlist_songs>(`
			SELECT s.*, l.share_id as library_id, ps.playlist_song_id
			FROM ${SongsTable.name} s
			INNER JOIN ${PlaylistSongsTable.name} ps ON ps.song_id_ref = s.song_id
			INNER JOIN share_songs sls ON sls.song_id_ref = s.song_id
			INNER JOIN shares l ON l.share_id = sls.share_id_ref
			WHERE ps.playlist_id_ref = $1 AND l.is_library = true
			ORDER BY ps.position ASC;
		`, [playlistID]);

		const songs = await database.query(songQuery);

		return songs
			.filter(song => song.date_removed === null)
			.map(result => PlaylistSong.fromDBResult(result));
	};

	const updateOrder = async (shareID: string, playlistID: string, orderUpdates: OrderUpdate[]) => {
		const currentSongs = await getSongs(playlistID);
		const playlistSongIDsSet = new Set(currentSongs.map(song => song.playlistSongID))
		const someSongsIDsPartOfPlaylist = orderUpdates.map(orderUpdate =>
			orderUpdate[0]).some(playlistSongID => !playlistSongIDsSet.has(playlistSongID))

		if (someSongsIDsPartOfPlaylist) {
			throw new Error(`Some songs are not part of this playlist`)
		}

		await executeOrderUpdates(orderUpdates);
	}

	const executeOrderUpdates = async (orderUpdates: OrderUpdate[]) => {
		const updateOrderQuery = PlaylistSongsTable.update(['position'], ['playlist_song_id']);
		const queries = orderUpdates
			.map(orderUpdate => updateOrderQuery([orderUpdate[1]], [orderUpdate[0]]));

		await database.transaction(async (client) => {
			await Promise.all(queries.map(query => client.query(query)))
		})
	}

	const getPlaylistsForShare = async (shareID: string): Promise<Playlist[]> => {
		const sharePlaylistQuery = SQL.raw<typeof Tables.playlists>(`
			SELECT p.* FROM ${PlaylistsTable.name} p
			INNER JOIN ${SharePlaylistsTable.name} sp ON sp.playlist_id_ref = p.playlist_id
			WHERE sp.share_id_ref = $1 AND p.date_removed IS NULL
			ORDER BY p.date_added;
		`, [shareID])

		const playlists = await database.query(sharePlaylistQuery);

		return playlists
			.filter(playlist => playlist.date_removed === null)
			.map(playlist => Playlist.fromDBResult(playlist, shareID));
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
};