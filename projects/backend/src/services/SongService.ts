import { Song } from '../models/SongModel';
import { IDatabaseClient, SQL } from 'postgres-schema-builder';
import { SongUpdateInput } from '../inputs/SongInput';
import * as snakeCaseObjKeys from 'snakecase-keys';
import moment = require('moment');
import { ISongDBResult, CoreTables, SongsTable, ShareSongsTable } from '../database/schema/tables';
import { v4 as uuid } from 'uuid';

export class SongNotFoundError extends Error {
	constructor(shareID: string, songID: string) {
		super(`Song with id ${songID} not found in share ${shareID}`);
	}
}

export interface ISongService {
	getByID(shareID: string, songID: string): Promise<Song>;
	getByShare(shareID: string): Promise<Song[]>;
	getByShareDirty(shareID: string, lastTimestamp: number): Promise<Song[]>;
	create(shareID: string, song: ISongDBResult): Promise<string>;
	update(shareID: string, songID: string, song: SongUpdateInput): Promise<void>;
}

export class SongService implements ISongService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getByID(shareID: string, songID: string): Promise<Song> {
		const dbResults = await this.database.query(
			SQL.raw<typeof CoreTables.songs>(`
				SELECT s.* FROM ${SongsTable.name} s
				INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
				WHERE s.song_id = $1 AND ss.share_id_ref = $2 AND s.date_removed IS NULL;
			`, [songID, shareID])
		);

		if (dbResults.length === 0) {
			throw new SongNotFoundError(shareID, songID);
		}

		return Song.fromDBResult(dbResults[0]);

	}

	public async getByShare(shareID: string): Promise<Song[]> {
		const dbResults = await this.database.query(
			SQL.raw<typeof CoreTables.songs>(`
				SELECT s.* FROM ${SongsTable.name} s
				INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
				WHERE ss.share_id_ref = $1 AND s.date_removed IS NULL
				ORDER BY s.date_added;
			`, [shareID])
		);

		return dbResults
			.map(Song.fromDBResult);
	}

	public async getByShareDirty(shareID: string, lastTimestamp: number): Promise<Song[]> {
		const songs = await this.getByShare(shareID);
		// TODO do via SQL query
		return songs.filter(song => moment(song.dateLastEdit).valueOf() > lastTimestamp);
	}

	public async create(shareID: string, song: ISongDBResult): Promise<string> {
		// istanbul ignore next
		let id = song.song_id || uuid();

		await this.database.query(SongsTable.insertFromObj(song));
		await this.database.query(ShareSongsTable.insertFromObj({ share_id_ref: shareID, song_id_ref: id }));

		return id.toString();
	}

	public async update(shareID: string, songID: string, song: SongUpdateInput): Promise<void> {
		const baseSong: Partial<ISongDBResult> = {
			...snakeCaseObjKeys(song),
			date_last_edit: new Date(),
		}

		await this.updateShareSong(shareID, songID, baseSong);
	}

	private async updateShareSong(shareID: string, songID: string, baseSong: Partial<ISongDBResult>) {
		await this.database.query(
			SongsTable.update(Object.keys(baseSong) as any, ['song_id'])
				(Object.values(baseSong), [songID])
		);
	}
}