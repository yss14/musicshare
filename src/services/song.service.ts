import { Share } from './../models/share.model';
import { DatabaseConnection } from "../database/DatabaseConnection";
import { Song } from '../models/song.model';
import { ISongByShareDBResult, ISongByShareDBInsert } from '../database/schema/initial-schema';
import { plainToClass } from "class-transformer";
import { types as CTypes } from 'cassandra-driver';

export class SongService {
	constructor(
		private readonly database: DatabaseConnection,
	) { }

	public getByID(shareID: string, songID: string): Promise<Song | null> {
		return this.database.select<ISongByShareDBResult>(`
			SELECT * FROM songs_by_share WHERE share_id = ? AND id = ?;
		`, [shareID, songID])
			.then(rows => rows.length === 0 ? null : this.fromDBResult(rows[0]));
	}

	public getByShare(share: Share): Promise<Song[]> {
		return this.database.select<ISongByShareDBResult>(`
			SELECT * FROM songs_by_share WHERE share_id = ?;
		`, [share.id])
			.then(rows => rows.map(row => this.fromDBResult(row)));
	}

	private fromDBResult(row: ISongByShareDBResult): Song {
		return plainToClass(
			Song,
			{
				id: row.id.toString(),
				title: row.title,
				suffix: row.suffix,
				year: row.year,
				bpm: row.bpm,
				dateLastEdit: row.date_last_edit,
				releaseDate: row.release_date ? row.release_date.toString() : null,
				isRip: row.is_rip,
				artists: row.artists || [],
				remixer: row.remixer || [],
				featurings: row.featurings || [],
				type: row.type,
				genres: row.genres || [],
				label: row.label,
				needsUserAction: row.needs_user_action,
				file: JSON.parse(row.file)
			}
		)
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