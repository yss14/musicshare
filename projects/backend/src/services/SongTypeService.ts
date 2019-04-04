import { IDatabaseClient } from "cassandra-schema-builder";
import { SongTypesTable, ISongTypeDBResult } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";
import { ISongType } from "../models/interfaces/SongType";
import { SongType } from "../models/SongType";
import { flatten } from 'lodash';

export interface ISongTypeService {
	getSongTypesForShare(shareID: string): Promise<SongType[]>;
	getSongTypesForShares(shareIDs: string[]): Promise<SongType[]>;

	addSongTypeToShare(shareID: string, songType: SongType): Promise<void>;
	removeSongTypeFromShare(shareID: string, songType: SongType): Promise<void>;
}

const makeQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(SongTypesTable.select('*', ['share_id'])([TimeUUID(shareID)]));

const makeInsertSongTypeQuery = (songTypeObj: ISongTypeDBResult) => SongTypesTable.insertFromObj(songTypeObj);
const makeDeleteSongTypeQuery = () =>
	SongTypesTable.update(['date_removed'], ['share_id', 'name', 'group']);

const filterNotRemoved = (row: ISongTypeDBResult) => row.date_removed === null;

export class SongTypeService implements ISongTypeService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSongTypesForShare(shareID: string) {
		const dbResult = await makeQueryWithShareID(this.database, shareID);

		return dbResult
			.filter(filterNotRemoved)
			.map(SongType.fromDBResult);
	}

	public async getSongTypesForShares(shareIDs: string[]) {
		const dbResults = await Promise.all(shareIDs.map(shareID => makeQueryWithShareID(this.database, shareID)));

		return flatten(dbResults)
			.filter(filterNotRemoved)
			.map(SongType.fromDBResult);
	}

	public async addSongTypeToShare(shareID: string, songType: ISongType) {
		const insertQuery = makeInsertSongTypeQuery({
			share_id: TimeUUID(shareID),
			name: songType.name,
			group: songType.group,
			alternative_names: songType.alternativeNames || null,
			has_artists: songType.hasArtists,
			date_added: new Date(),
			date_removed: null
		});

		await this.database.query(insertQuery);
	}

	public async removeSongTypeFromShare(shareID: string, songType: ISongType) {
		const { name, group } = songType;
		const deleteQuery = makeDeleteSongTypeQuery()([new Date()], [TimeUUID(shareID), name, group]);

		await this.database.query(deleteQuery);
	}
}