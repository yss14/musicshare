import { IDatabaseClient } from "postgres-schema-builder";
import { SongTypesByShareTable, ISongTypeByShareDBResult } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";
import { SongType } from "../models/SongType";
import { flatten } from 'lodash';

export interface ISongTypeService {
	getSongTypesForShare(shareID: string): Promise<SongType[]>;
	getSongTypesForShares(shareIDs: string[]): Promise<SongType[]>;

	addSongTypeToShare(shareID: string, songType: SongType): Promise<void>;
	removeSongTypeFromShare(shareID: string, songType: SongType): Promise<void>;
}

const selectQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(SongTypesByShareTable.select('*', ['share_id'])([TimeUUID(shareID)]));

const makeInsertSongTypeQuery = (songTypeObj: ISongTypeByShareDBResult) => SongTypesByShareTable.insertFromObj(songTypeObj);
const makeDeleteSongTypeQuery = () =>
	SongTypesByShareTable.update(['date_removed'], ['share_id', 'name', 'group']);

const filterNotRemoved = (row: ISongTypeByShareDBResult) => row.date_removed === null;

export class SongTypeService implements ISongTypeService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSongTypesForShare(shareID: string) {
		const dbResult = await selectQueryWithShareID(this.database, shareID);

		return dbResult
			.filter(filterNotRemoved)
			.map(SongType.fromDBResult);
	}

	public async getSongTypesForShares(shareIDs: string[]) {
		const dbResults = await Promise.all(shareIDs.map(shareID => selectQueryWithShareID(this.database, shareID)));

		return flatten(dbResults)
			.filter(filterNotRemoved)
			.map(SongType.fromDBResult);
	}

	public async addSongTypeToShare(shareID: string, songType: SongType) {
		const insertQuery = makeInsertSongTypeQuery({
			share_id: TimeUUID(shareID),
			name: songType.name,
			group: songType.group,
			alternative_names: songType.alternativeNames,
			has_artists: songType.hasArtists,
			date_added: new Date(),
			date_removed: null
		});

		await this.database.query(insertQuery);
	}

	public async removeSongTypeFromShare(shareID: string, songType: SongType) {
		const { name, group } = songType;
		const deleteQuery = makeDeleteSongTypeQuery()([new Date()], [TimeUUID(shareID), name, group]);

		await this.database.query(deleteQuery);
	}
}