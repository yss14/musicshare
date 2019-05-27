import { ShareSong, shareSongFromDBResult } from '../models/SongModel';
import { sortByTimeUUIDAsc } from '../utils/sort/sort-timeuuid';
import { TimeUUID } from '../types/TimeUUID';
import { IDatabaseClient } from 'postgres-schema-builder';
import { ISongByShareDBResult, SongsByShareTable, ISongBaseDBResult } from '../database/schema/tables';
import { SongUpdateInput } from '../inputs/SongInput';
import * as snakeCaseObjKeys from 'snakecase-keys';
import moment = require('moment');

export class SongNotFoundError extends Error {
	constructor(shareID: string, songID: string) {
		super(`Song with id ${songID} not found in share ${shareID}`);
	}
}

export interface ISongService {
	getByID(shareID: string, songID: string): Promise<ShareSong>;
	getByShare(shareID: string): Promise<ShareSong[]>;
	getByShareDirty(shareID: string, lastTimestamp: number): Promise<ShareSong[]>;
	create(song: ISongByShareDBResult): Promise<string>;
	update(shareID: string, songID: string, song: SongUpdateInput): Promise<void>;
}

export class SongService implements ISongService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getByID(shareID: string, songID: string): Promise<ShareSong> {
		const dbResults = await this.database.query(
			SongsByShareTable.select('*', ['share_id', 'song_id'])
				([TimeUUID(shareID), TimeUUID(songID)])
		)

		if (dbResults.length === 0) {
			throw new SongNotFoundError(shareID, songID);
		}

		return shareSongFromDBResult(dbResults[0]);

	}

	public async getByShare(shareID: string): Promise<ShareSong[]> {
		const dbResults = await this.database.query(
			SongsByShareTable.select('*', ['share_id'])([TimeUUID(shareID)])
		);

		return dbResults
			.map(shareSongFromDBResult)
			.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.id, rhs.id));
	}

	public async getByShareDirty(shareID: string, lastTimestamp: number): Promise<ShareSong[]> {
		const songs = await this.getByShare(shareID);

		return songs.filter(song => moment(song.dateLastEdit).valueOf() > lastTimestamp);
	}

	public async create(song: ISongByShareDBResult): Promise<string> {
		// istanbul ignore next
		let id = song.song_id || TimeUUID();

		await this.database.query(
			SongsByShareTable.insertFromObj(song)
		);

		return id.toString();
	}

	public async update(shareID: string, songID: string, song: SongUpdateInput): Promise<void> {
		const baseSong: Partial<ISongBaseDBResult> = {
			...snakeCaseObjKeys(song),
			date_last_edit: new Date(),
		}

		await this.updateShareSong(shareID, songID, baseSong);
	}

	private async updateShareSong(shareID: string, songID: string, baseSong: Partial<ISongBaseDBResult>) {
		await this.database.query(
			SongsByShareTable.update(Object.keys(baseSong) as any, ['song_id', 'share_id'])
				(Object.values(baseSong), [TimeUUID(songID), TimeUUID(shareID)])
		);
	}
}