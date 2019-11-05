import { Song } from '../models/SongModel';
import { IDatabaseClient, SQL } from 'postgres-schema-builder';
import { SongUpdateInput } from '../inputs/SongInput';
import * as snakeCaseObjKeys from 'snakecase-keys';
import moment = require('moment');
import { ISongDBResult, CoreTables, SongsTable, ShareSongsTable, SharesTable, UserSharesTable } from '../database/schema/tables';
import { v4 as uuid } from 'uuid';
import { ForbiddenError } from 'apollo-server-core';
import { Share } from '../models/ShareModel';
import { uniqBy } from 'lodash'

export class SongNotFoundError extends ForbiddenError {
	constructor(shareID: string, songID: string, proxied: boolean = false) {
		super(`Song with id ${songID} not found in share ${shareID}${proxied ? ' via proxy' : ''}`);
	}
}

type ShareLike = Share | { id: string, isLibrary: boolean } | string;

export interface ISongService {
	getByID(share: ShareLike, songID: string): Promise<Song>;
	getByShare(share: ShareLike): Promise<Song[]>;
	getSongOriginShare(referencedShareID: string, songID: string): Promise<Share | null>;
	getByShareDirty(shareID: string, lastTimestamp: number): Promise<Song[]>;
	create(shareID: string, song: ISongDBResult): Promise<string>;
	update(shareID: string, songID: string, song: SongUpdateInput): Promise<void>;
}

export class SongService implements ISongService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getByID(share: ShareLike, songID: string): Promise<Song> {
		const getByShare = async (shareID: string) => {
			const dbResults = await this.database.query(
				SQL.raw<typeof CoreTables.songs & typeof CoreTables.share_songs>(`
					SELECT s.*, ss.share_id_ref
					FROM ${SongsTable.name} s
					INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
					WHERE s.song_id = $1 AND ss.share_id_ref = $2 AND s.date_removed IS NULL;
				`, [songID, shareID])
			);

			if (dbResults.length === 0) {
				throw new SongNotFoundError(shareID, songID);
			}

			return Song.fromDBResult(dbResults[0]);
		}

		if (typeof share === 'string') {
			return getByShare(share);
		} else if (share.isLibrary) {
			return getByShare(share.id);
		} else {
			const originShare = await this.getSongOriginShare(share.id, songID);

			if (!originShare) {
				throw new SongNotFoundError(share.id, songID, true);
			}

			return getByShare(originShare.id);
		}
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

			const mergedSongs = await this.getByShares(shareLibrariesResult.map(result => result.share_id));

			return uniqBy(mergedSongs, song => song.id);
		}
	}

	private async getByShares(shareIDs: string[]): Promise<Song[]> {
		const dbResults = await this.database.query(
			SQL.raw<typeof CoreTables.songs & typeof CoreTables.share_songs>(`
				SELECT s.*, ss.share_id_ref
				FROM ${SongsTable.name} s
				INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = s.song_id
				WHERE ss.share_id_ref = ANY($1) AND s.date_removed IS NULL
				ORDER BY s.date_added;
			`, [shareIDs])
		);

		return dbResults
			.map(Song.fromDBResult);
	}

	public async getSongOriginShare(referencedShareID: string, songID: string): Promise<Share | null> {
		const dbResults = await this.database.query(
			SQL.raw<typeof CoreTables.shares>(`
				SELECT DISTINCT shares.*
				FROM ${SongsTable.name} songs
				INNER JOIN ${ShareSongsTable.name} ss ON ss.song_id_ref = songs.song_id
				INNER JOIN ${SharesTable.name} shares ON shares.share_id = ss.share_id_ref
				INNER JOIN ${UserSharesTable.name} us1 ON us1.share_id_ref = shares.share_id
				INNER JOIN ${UserSharesTable.name} us2 ON us2.user_id_ref = us1.user_id_ref
				WHERE songs.song_id = $1 
					AND us2.share_id_ref = $2 
					AND shares.date_removed IS NULL 
					AND songs.date_removed IS NULL;
			`, [songID, referencedShareID])
		)

		if (dbResults.length > 0) {
			return Share.fromDBResult(dbResults[0]);
		} else {
			return null;
		}
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