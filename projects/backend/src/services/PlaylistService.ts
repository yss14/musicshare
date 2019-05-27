import { PlaylistSong, playlistSongFromDBResult } from "../models/SongModel";
import { IDatabaseClient, SQL } from "postgres-schema-builder";
import { Playlist } from "../models/PlaylistModel";
import { ISongService } from "./SongService";
import { IPlaylistDBResult, PlaylistsTable, SharePlaylistsTable, PlaylistSongsTable, SongsTable, CoreTables } from "../database/schema/tables";
import { v4 as uuid } from 'uuid';

export type OrderUpdate = [string, number];

export class PlaylistNotFoundError extends Error {
	constructor(playlistID: string) {
		super(`Playlist with id ${playlistID} not found`);
	}
}

export interface IPlaylistService {
	getByID(shareID: string, playlistID: string): Promise<Playlist>;
	create(shareID: string, name: string, id?: string): Promise<Playlist>;
	delete(shareID: string, playlistID: string): Promise<void>;
	rename(shareID: string, playlistID: string, newName: string): Promise<void>;
	addSongs(shareID: string, playlistID: string, songIDs: string[]): Promise<void>;
	removeSongs(shareID: string, playlistID: string, songIDs: string[]): Promise<void>;
	getSongs(shareID: string, playlistID: string): Promise<PlaylistSong[]>;
	updateOrder(shareID: string, playlistID: string, orderUpdates: OrderUpdate[]): Promise<void>;
	getPlaylistsForShare(shareID: string): Promise<Playlist[]>;
}

interface IPlaylistServiceArgs {
	database: IDatabaseClient;
	songService: ISongService;
}

export const PlaylistService = ({ database, songService }: IPlaylistServiceArgs): IPlaylistService => {
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
		await database.query(SharePlaylistsTable.insertFromObj({ share_id_ref: shareID, playlist_id_ref: playlistID }));

		return Playlist.fromDBResult(playlistObj);
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
		const songNotInPlaylist = (songID: string) => currentSongs.findIndex(currentSong => currentSong.id === songID) === -1;
		const songShouldBeAdded = (songID: string) => songIDs.includes(songID);

		const currentSongs = await getSongs(shareID, playlistID);
		const shareSongs = await songService.getByShare(shareID);
		const insertQueries = shareSongs
			.filter(song => songShouldBeAdded(song.id) && songNotInPlaylist(song.id))
			.map(song => PlaylistSongsTable.insertFromObj({ playlist_id_ref: playlistID, song_id_ref: song.id }));

		await Promise.all(insertQueries.map(insertQuery => database.query(insertQuery))); // TODO transactional
	};

	const removeSongs = async (shareID: string, playlistID: string, songIDs: string[]) => {
		const deleteQuerys = songIDs.map(songID => ({
			sql: `DELETE FROM ${PlaylistSongsTable.name} WHERE playlist_id_ref = $1 AND song_id_ref = $2;`,
			values: [playlistID, songID],
		}));
		await Promise.all(deleteQuerys.map(deleteQuery => database.query(deleteQuery))); // TODO transactional

		await normalizeOrder(shareID, playlistID);
	}

	const normalizeOrder = async (shareID: string, playlistID: string) => {
		const songs = await getSongs(shareID, playlistID);

		const orderUpdates = songs
			.sort((lhs, rhs) => lhs.position - rhs.position)
			.map((song, idx): OrderUpdate => [song.id.toString(), idx]);

		await executeOrderUpdates(shareID, playlistID, orderUpdates);
	}

	const getSongs = async (shareID: string, playlistID: string): Promise<PlaylistSong[]> => {
		const songQuery = SQL.raw<typeof CoreTables.songs>(`
			SELECT s.* FROM ${SongsTable.name}
			INNER JOIN ${PlaylistSongsTable.name} ps ON ps.song_id_ref = s.song_id
			WHERE ps.playlist_id_ref = $1;
		`, [playlistID]);

		const songs = await database.query(songQuery);

		return songs
			.filter(song => song.date_removed === null)
			.map(song => playlistSongFromDBResult({ ...song })); // TODO unify
	};

	const updateOrder = async (shareID: string, playlistID: string, orderUpdates: OrderUpdate[]) => {
		const currentSongs = await getSongs(shareID, playlistID);
		const someSongsIDsPartOfPlaylist = orderUpdates.map(orderUpdate =>
			orderUpdate[0]).some(songID =>
				currentSongs.findIndex(currentSong =>
					currentSong.id === songID) === -1)

		if (someSongsIDsPartOfPlaylist) {
			throw new Error(`Some songs are not part of this playlist`)
		}

		await executeOrderUpdates(shareID, playlistID, orderUpdates);
	}

	const executeOrderUpdates = async (shareID: string, playlistID: string, orderUpdates: OrderUpdate[]) => {
		const updateOrderQuery = PlaylistSongsTable.update(['position'], ['playlist_id_ref', 'song_id_ref']);
		const queries = orderUpdates
			.map(orderUpdate => updateOrderQuery([orderUpdate[1]], [playlistID, orderUpdate[0]]));

		await Promise.all(queries.map(query => database.query(query))); // TODO transactional
	}

	const getPlaylistsForShare = async (shareID: string): Promise<Playlist[]> => {
		const sharePlaylistQuery = SQL.raw<typeof CoreTables.playlists>(`
			SELECT p.* FROM ${PlaylistsTable.name}
			INNER JOIN ${SharePlaylistsTable.name} sp ON sp.playlist_id_ref = p.playlist_id
			WHERE sp.share_id_ref = $1;
		`, [shareID])

		const playlists = await database.query(sharePlaylistQuery);

		return playlists
			.filter(playlist => playlist.date_removed === null)
			.map(Playlist.fromDBResult);
	}

	return {
		getByID,
		create,
		delete: del,
		rename,
		addSongs,
		removeSongs,
		getSongs,
		updateOrder,
		getPlaylistsForShare,
	}
};