import { Share } from './../models/share.model';
import { Service, Inject } from "typedi";
import { Database } from "../database/database";
import { Song } from '../models/song.model';
import { ISongByShareDBResult, ISongByShareDBInsert } from '../database/schema/initial-schema';
import { plainToClass } from "class-transformer";
import { types as CTypes } from 'cassandra-driver';

@Service()
export class SongService {
	constructor(
		@Inject("DATABASE") private readonly database: Database
	) { }

	public getByShare(share: Share): Promise<Song[]> {
		return this.database.select<ISongByShareDBResult>(`
			SELECT * FROM songs_by_share WHERE share_id = ?;
		`, [share.id])
			.then(rows => rows.map(row => this.fromDBResult(row)));
	}

	public async create(song: ISongByShareDBInsert): Promise<string> {
		let id = CTypes.TimeUuid.now();

		if ((song as any).id) {
			id = (song as any).id;
		}

		const columns = Object.keys(song).filter(k => k !== 'id');
		const values = columns.map(c => (song as any)[c]);
		console.log(`
		INSERT INTO songs_by_share
		(id, ${columns.join(',')})
		VALUES 
		(?, ${values.map(v => '?').join(',')});
	`);

		await this.database.execute(`
			INSERT INTO songs_by_share
			(id, ${columns.join(',')})
			VALUES 
			(?, ${values.map(v => '?').join(',')});
		`, [id, ...values], { prepare: true });

		return id.toString();
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
}