import { Song } from "../models/SongModel";
import { IDatabaseClient } from "cassandra-schema-builder";
import { PlaylistsByShareTable, IPlaylistByShareDBResult, ISongByPlaylistDBResult, ISongByShareDBResult, SongsByPlaylistTable } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";
import { Playlist } from "../models/PlaylistModel";
import * as snakeCaseObjKeys from 'snakecase-keys';

export type OrderUpdate = [number, number];

export interface IPlaylistService {
	create(shareID: string, name: string, id?: string): Promise<Playlist>;
	delete(id: string): Promise<void>;
	rename(id: string, newName: string): Promise<void>;
	addSongs(id: string, songs: Song[]): Promise<void>;
	getSongs(id: string): Promise<Song[]>;
	updateOrder(id: string, orderUpdates: OrderUpdate[]): Promise<Song[]>;
	getPlaylistsForShare(shareID: string): Promise<Playlist[]>;
}

interface IPlaylistServiceArgs {
	database: IDatabaseClient;
}

export const PlaylistService = ({ database }: IPlaylistServiceArgs): IPlaylistService => {
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

	const del = async (id: string) => {
		await database.query(
			PlaylistsByShareTable.update(['date_removed'], ['id'])([new Date()], [TimeUUID(id)])
		);
	};

	const rename = async (id: string, newName: string) => {
		await database.query(
			PlaylistsByShareTable.update(['name'], ['id'])([newName], [TimeUUID(id)])
		);
	};

	const addSongs = async (id: string, songs: Song[]) => {
		const currentSongs = await getSongs(id);
		const songObjects: ISongByPlaylistDBResult[] = songs
			.filter(song => currentSongs.findIndex(currentSong => currentSong.id === song.id) === -1)
			.map(({ requiresUserAction, ...song }, idx) => ({
				...(snakeCaseObjKeys(song) as ISongByShareDBResult),
				playlist_id: TimeUUID(id),
				position: currentSongs.length + idx,
				date_added: new Date(),
				date_removed: null,
				file: JSON.stringify(song.file),
			}));

		await Promise.all(songObjects.map(songObj => database.query(SongsByPlaylistTable.insertFromObj(songObj))));
	};

	const getSongs = async (id: string): Promise<Song[]> => {
		const songs = await database.query(SongsByPlaylistTable.select('*', ['playlist_id'])([TimeUUID(id)]));

		return songs
			.filter(song => song.date_removed === null)
			.map(song => Song.fromDBResult({ ...song, requires_user_action: false }));
	};

	const updateOrder = async (id: string, orderUpdates: OrderUpdate[]) => {
		throw 'Not implemented yet';
	}

	const getPlaylistsForShare = async (shareID: string): Promise<Playlist[]> => {
		const playlists = await database.query(PlaylistsByShareTable.select('*', ['share_id'])([TimeUUID(shareID)]));

		return playlists
			.filter(playlist => playlist.date_removed === null)
			.map(Playlist.fromDBResult);
	}

	return {
		create,
		delete: del,
		rename,
		addSongs,
		getSongs,
		updateOrder,
		getPlaylistsForShare,
	}
};