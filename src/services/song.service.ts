import { Share } from './../models/share.model';
import { Service, Inject } from "typedi";
import { Database } from "../database/database";
import { Song } from '../models/song.model';
import { ISongByShareDBResult } from '../database/schema/initial-schema';
import { plainToClass } from "class-transformer";

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
				label: row.label
			}
		)
	}
}