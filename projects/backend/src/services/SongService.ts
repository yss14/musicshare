import { Share } from '../models/ShareModel';
import { Song } from '../models/SongModel';
import { sortByTimeUUIDAsc } from '../utils/sort/sort-timeuuid';
import { TimeUUID } from '../types/TimeUUID';
import { IDatabaseClient } from 'cassandra-schema-builder';
import { ISongByShareDBResult, SongsByShareTable } from '../database/schema/tables';

export class SongNotFoundError extends Error {
	constructor(shareID: string, songID: string) {
		super(`Song with id ${songID} not found in share ${shareID}`);
	}
}

export interface ISongService {
	getByID(shareID: string, songID: string): Promise<Song>;
	getByShare(share: Share): Promise<Song[]>;
	create(song: ISongByShareDBResult): Promise<string>;
}

export class SongService implements ISongService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getByID(shareID: string, songID: string): Promise<Song> {
		const dbResults = await this.database.query(
			SongsByShareTable.select('*', ['share_id', 'id'])
				([TimeUUID.fromString(shareID), TimeUUID.fromString(songID)])
		)

		if (dbResults.length === 0) {
			throw new SongNotFoundError(shareID, songID);
		}

		return Song.fromDBResult(dbResults[0]);

	}

	public async getByShare(share: Share): Promise<Song[]> {
		const dbResults = await this.database.query(
			SongsByShareTable.select('*', ['share_id'])([TimeUUID.fromString(share.id)])
		);

		return dbResults
			.map(Song.fromDBResult)
			.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.id, rhs.id));
	}

	public async create(song: ISongByShareDBResult): Promise<string> {
		let id = song.id || TimeUUID.now();

		await this.database.query(
			SongsByShareTable.insertFromObj(song)
		);

		return id.toString();
	}
}