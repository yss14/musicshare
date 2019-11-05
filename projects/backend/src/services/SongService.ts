import { Song } from '../models/SongModel';
import { IDatabaseClient, SQL } from 'postgres-schema-builder';
import { SongUpdateInput } from '../inputs/SongInput';
import * as snakeCaseObjKeys from 'snakecase-keys';
import moment = require('moment');
import { ISongDBResult, CoreTables, SongsTable, ShareSongsTable } from '../database/schema/tables';
import { v4 as uuid } from 'uuid';
import { ForbiddenError } from 'apollo-server-core';
import { Share } from '../models/ShareModel';

export class SongNotFoundError extends ForbiddenError {
	constructor(shareID: string, songID: string) {
		super(`Song with id ${songID} not found in share ${shareID}`);
	}
}

type ShareLike = Share | { id: string, isLibrary: boolean } | string;

export interface ISongService {
	getByID(shareID: string, songID: string): Promise<Song>;
	getByShare(share: ShareLike): Promise<Song[]>;
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

	public async getByShare(share: ShareLike): Promise<Song[]> {
		if (typeof share === 'string') {
			return this.getByShares([share])
		} else if (share.isLibrary) {
			return this.getByShares([share.id]);
		} else {
			const shareLibrariesResult = await this.database.query(
				SQL.raw<typeof CoreTables.shares>(`
					SELECT DISTINCt sl.*
					FROM shares sl, user_shares su, user_shares ul
					WHERE su.share_id_ref = $1
					AND ul.user_id_ref = su.user_id_ref
					AND ul.share_id_ref = sl.share_id
					AND sl.is_library = true
					AND sl.date_removed IS NULL;				
				`, [share.id])
			);

			return this.getByShares(shareLibrariesResult.map(result => result.share_id));
		}
	}

	private async getByShares(shareIDs: string[]): Promise<Song[]> {
		const dbResults = await this.database.query(
			SQL.raw<typeof CoreTables.songs>(`
				SELECT s.* FROM ${SongsTable.name} s
				INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
				WHERE ss.share_id_ref = ANY($1) AND s.date_removed IS NULL
				ORDER BY s.date_added;
			`, [shareIDs])
		);

		return dbResults
			.map(Song.fromDBResult);
	}

	public async getByShareDirty(shareID: string, lastTimestamp: number): Promise<Song[]> {
		const songs = await this.getByShare(shareID);

		return songs.filter(song => moment(song.dateLastEdit).valueOf() > lastTimestamp); // TODO do via SQL query
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
			...snakeCaseObjKeys(song as any),
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