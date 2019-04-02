import { IDatabaseClient } from "cassandra-schema-builder";
import { SongTypesTable, ISongTypeDBResult } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";

export interface ISongTypeService {
	getSongTypesForShare(shareID: string): Promise<string[]>;
	getSongTypesForShares(shareIDs: string[]): Promise<string[]>;

	addSongTypeToShare(shareID: string, name: string, group: string): Promise<void>;
	removeSongTypeFromShare(shareID: string, name: string, group: string): Promise<void>;
}

const makeQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(SongTypesTable.select('*', ['share_id'])([TimeUUID(shareID)]));

const makeInsertSongTypeQuery = (songTypeObj: ISongTypeDBResult) => SongTypesTable.insertFromObj(songTypeObj);
const makeDeleteSongTypeQuery = () =>
	SongTypesTable.update(['date_removed'], ['share_id', 'name', 'group']);

const filterNotRemovedAndMapName = (rows: ISongTypeDBResult[]) => rows
	.filter(row => row.date_removed === null)
	.map(row => row.name);

export class SongTypeService implements ISongTypeService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSongTypesForShare(shareID: string) {
		const dbResult = await makeQueryWithShareID(this.database, shareID);

		return filterNotRemovedAndMapName(dbResult);
	}

	public async getSongTypesForShares(shareIDs: string[]) {
		const dbResults = await Promise.all(shareIDs.map(shareID => makeQueryWithShareID(this.database, shareID)));

		return Array.from(
			dbResults
				.map(filterNotRemovedAndMapName)
				.reduce((uniqueSongtypes, songtypes) => {
					songtypes.forEach(songtype => uniqueSongtypes.add(songtype));

					return uniqueSongtypes;
				}, new Set<string>())
		);
	}

	public async addSongTypeToShare(shareID: string, name: string, group: string) {
		const insertQuery = makeInsertSongTypeQuery({
			share_id: TimeUUID(shareID),
			name,
			group,
			date_added: new Date(),
			date_removed: null
		});

		await this.database.query(insertQuery);
	}

	public async removeSongTypeFromShare(shareID: string, name: string, group: string) {
		const deleteQuery = makeDeleteSongTypeQuery()([new Date()], [TimeUUID(shareID), name, group]);

		await this.database.query(deleteQuery);
	}
}