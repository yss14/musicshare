import { Share } from '../models/ShareModel';
import { DatabaseConnection } from "../database/DatabaseConnection";
import { Song } from '../models/SongModel';
import { ISongByShareDBResult, ISongByShareDBInsert } from '../database/schema/initial-schema';
import { types as CTypes } from 'cassandra-driver';
import { sortByTimeUUIDAsc } from '../utils/sort/sort-timeuuid';

export class SongNotFoundError extends Error {
	constructor(shareID: string, songID: string) {
		super(`Song with id ${songID} not found in share ${shareID}`);
	}
}

export class SongService {
	constructor(
		private readonly database: DatabaseConnection,
	) { }

	public async getByID(shareID: string, songID: string): Promise<Song | null> {
		const rows = await this.database.select<ISongByShareDBResult>(`
			SELECT * FROM songs_by_share WHERE share_id = ? AND id = ?;
		`, [shareID, songID]);

		if (rows.length === 0) {
			throw new SongNotFoundError(shareID, songID);
		} else {
			return Song.fromDBResult(rows[0]);
		}
	}

	public getByShare(share: Share): Promise<Song[]> {
		return this.database.select<ISongByShareDBResult>(`
			SELECT * FROM songs_by_share WHERE share_id = ?;
		`, [share.id])
			.then(rows => rows.map(row => Song.fromDBResult(row)))
			.then(songs => songs.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.id, rhs.id)));
	}

	public async create(song: ISongByShareDBInsert): Promise<string> {
		let id = CTypes.TimeUuid.now();

		if ((song as any).id) {
			id = (song as any).id;
		}

		const columns = Object.keys(song).filter(k => k !== 'id');
		const values = columns.map(c => (song as any)[c]);

		await this.database.execute(`
			INSERT INTO songs_by_share
			(id, ${columns.join(',')})
			VALUES 
			(?, ${values.map(v => '?').join(',')});
		`, [id, ...values], { prepare: true });

		return id.toString();
	}
}