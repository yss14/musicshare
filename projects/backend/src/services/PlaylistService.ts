import { IDatabaseClient, SQL } from "postgres-schema-builder";
import { Playlist } from "../models/PlaylistModel";
import { ISongService } from "./SongService";
import { IPlaylistDBResult, PlaylistsTable, SharePlaylistsTable, PlaylistSongsTable, SongsTable, CoreTables, ShareSongsTable } from "../database/schema/tables";
import { v4 as uuid } from 'uuid';
import { Song } from "../models/SongModel";
import { ForbiddenError } from "apollo-server-core";

export type OrderUpdate = [string, number];

export class PlaylistNotFoundError extends ForbiddenError {
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
	getSongs(playlistID: string): Promise<Song[]>;
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
		const shareSongs = await songService.getByShare(shareID);
		const shareSongIDs = new Set(shareSongs.map(song => song.id));

		const insertQueries = songIDs
			.filter(songID => shareSongIDs.has(songID))
			.map((songID, idx) => PlaylistSongsTable.insertFromObj({
				playlist_id_ref: playlistID,
				song_id_ref: songID,
				date_removed: null,
				date_added: new Date(),
				position: currentSongs.length + idx + 1
			}));

		await database.batch(insertQueries);
	};

	const removeSongs = async (shareID: string, playlistID: string, songIDs: string[]) => {
		const deleteQuerys = songIDs.map(songID => ({
			sql: `DELETE FROM ${PlaylistSongsTable.name} WHERE playlist_id_ref = $1 AND song_id_ref = $2;`,
			values: [playlistID, songID],
		}));
		await database.batch(deleteQuerys);

		await normalizeOrder(shareID, playlistID);
	}

	const normalizeOrder = async (shareID: string, playlistID: string) => {
		const songs = await getSongs(playlistID);

		const orderUpdates = songs
			.map((song, idx): OrderUpdate => [song.id.toString(), idx]);

		await executeOrderUpdates(shareID, playlistID, orderUpdates);
	}

	const getSongs = async (playlistID: string): Promise<Song[]> => {
		const songQuery = SQL.raw<typeof CoreTables.songs & typeof CoreTables.share_songs>(`
			SELECT s.*, ss.share_id_ref
			FROM ${SongsTable.name} s
			INNER JOIN ${PlaylistSongsTable.name} ps ON ps.song_id_ref = s.song_id
			INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
			WHERE ps.playlist_id_ref = $1
			ORDER BY ps.position ASC;
		`, [playlistID]);

		const songs = await database.query(songQuery);

		return songs
			.filter(song => song.date_removed === null)
			.map(Song.fromDBResult);
	};

	const updateOrder = async (shareID: string, playlistID: string, orderUpdates: OrderUpdate[]) => {
		const currentSongs = await getSongs(playlistID);
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

		await database.batch(queries);
	}

	const getPlaylistsForShare = async (shareID: string): Promise<Playlist[]> => {
		const sharePlaylistQuery = SQL.raw<typeof CoreTables.playlists>(`
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
		getSongs,
		updateOrder,
		getPlaylistsForShare,
	}
};