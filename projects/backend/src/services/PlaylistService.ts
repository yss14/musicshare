import { PlaylistSong, playlistSongFromDBResult } from "../models/SongModel";
import { IDatabaseClient } from "cassandra-schema-builder";
import { PlaylistsByShareTable, IPlaylistByShareDBResult, ISongByPlaylistDBResult, ISongByShareDBResult, SongsByPlaylistTable, ISongBaseDBResult } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";
import { Playlist } from "../models/PlaylistModel";
import * as snakeCaseObjKeys from 'snakecase-keys';
import { ISongService } from "./SongService";
import { SongUpdateInput } from "../inputs/SongInput";
import { IQuery } from "cassandra-schema-builder/build/table";

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
	updateSong(shareID: string, songID: string, song: SongUpdateInput): Promise<void>;
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
		const playlistObj: IPlaylistByShareDBResult = {
			id: TimeUUID(id || new Date()),
			name,
			share_id: TimeUUID(shareID),
			date_removed: null
		};

		await database.query(PlaylistsByShareTable.insertFromObj(playlistObj));

		return Playlist.fromDBResult(playlistObj);
	};

	const del = async (shareID: string, playlistID: string) => {
		await database.query(
			PlaylistsByShareTable.update(['date_removed'], ['share_id', 'id'])
				([new Date()], [TimeUUID(shareID), TimeUUID(playlistID)])
		);
	};

	const rename = async (shareID: string, playlistID: string, newName: string) => {
		await database.query(
			PlaylistsByShareTable.update(['name'], ['share_id', 'id'])
				([newName], [TimeUUID(shareID), TimeUUID(playlistID)])
		);
	};

	const addSongs = async (shareID: string, playlistID: string, songIDs: string[]) => {
		const songNotInPlaylist = (songID: string) => currentSongs.findIndex(currentSong => currentSong.id === songID) === -1;
		const songShouldBeAdded = (songID: string) => songIDs.includes(songID);

		const currentSongs = await getSongs(shareID, playlistID);
		const shareSongs = await songService.getByShare(shareID);
		const songObjects: ISongByPlaylistDBResult[] = shareSongs
			.filter(song => songShouldBeAdded(song.id) && songNotInPlaylist(song.id))
			.map(({ requiresUserAction, id, ...song }, idx) => ({
				...(snakeCaseObjKeys(song) as ISongByShareDBResult),
				song_id: TimeUUID(id),
				playlist_id: TimeUUID(playlistID),
				position: currentSongs.length + idx,
				date_added: new Date(),
				date_removed: null,
				file: JSON.stringify(song.file),
				share_id: TimeUUID(shareID),
			}));

		await Promise.all(songObjects.map(songObj => database.query(SongsByPlaylistTable.insertFromObj(songObj))));
	};

	const removeSongs = async (shareID: string, playlistID: string, songIDs: string[]) => {
		const updateDateRemovedQuery = SongsByPlaylistTable.update(['date_removed'], ['playlist_id', 'song_id', 'share_id']);
		const queries = songIDs.map(songID =>
			updateDateRemovedQuery([new Date()], [TimeUUID(playlistID), TimeUUID(songID), TimeUUID(shareID)]));

		await database.query(SongsByPlaylistTable.batch(queries));
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
		const songs = await database.query(
			SongsByPlaylistTable.select('*', ['share_id', 'playlist_id'])
				([TimeUUID(shareID), TimeUUID(playlistID)])
		);

		return songs
			.filter(song => song.date_removed === null)
			.map(song => playlistSongFromDBResult({ ...song }));
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
		const updateOrderQuery = SongsByPlaylistTable.update(['position'], ['playlist_id', 'song_id', 'share_id']);
		const queries = orderUpdates
			.map(orderUpdate => updateOrderQuery([orderUpdate[1]], [TimeUUID(playlistID), TimeUUID(orderUpdate[0]), TimeUUID(shareID)]));

		await database.query(SongsByPlaylistTable.batch(queries));
	}

	const getPlaylistsForShare = async (shareID: string): Promise<Playlist[]> => {
		const playlists = await database.query(PlaylistsByShareTable.select('*', ['share_id'])([TimeUUID(shareID)]));

		return playlists
			.filter(playlist => playlist.date_removed === null)
			.map(Playlist.fromDBResult);
	}

	const updateSong = async (shareID: string, songID: string, song: SongUpdateInput) => {
		const baseSong: Partial<ISongBaseDBResult> = {
			...snakeCaseObjKeys(song),
			date_last_edit: new Date(),
		}

		const sharePlaylists = await getPlaylistsForShare(shareID);

		const cql = `
			UPDATE ${SongsByPlaylistTable.name}
			SET ${Object.keys(baseSong).map(key => `${key} = ?`).join(', ')}
			WHERE playlist_id IN (${sharePlaylists.map(playlist => playlist.id).join(', ')})
				AND id = ${songID} AND share_id = ${shareID};
		`;

		const updateQuery: IQuery<{}> = {
			cql,
			values: Object.values(baseSong)
		};

		await database.query(updateQuery);
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
		updateSong,
	}
};