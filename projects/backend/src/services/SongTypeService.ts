import { IDatabaseClient } from "postgres-schema-builder";
import { SongType } from "../models/SongType";
import { flatten, uniqBy } from 'lodash';
import { SongTypesTable, ISongTypeDBResult } from "../database/schema/tables";
import { IShareService } from "./ShareService";

export interface ISongTypeService {
	getSongTypesForShare(shareID: string): Promise<SongType[]>;
	getSongTypesForShares(shareIDs: string[]): Promise<SongType[]>;
	getAggregatedSongTypesForUser(userID: string): Promise<SongType[]>;

	addSongTypeToShare(shareID: string, songType: SongType): Promise<void>;
	removeSongTypeFromShare(shareID: string, songType: SongType): Promise<void>;
}

const selectQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(SongTypesTable.select('*', ['share_id_ref'])([shareID]));

const makeInsertSongTypeQuery = (songTypeObj: ISongTypeDBResult) => SongTypesTable.insertFromObj(songTypeObj);
const makeDeleteSongTypeQuery = () =>
	SongTypesTable.update(['date_removed'], ['share_id_ref', 'name', 'group']);

const filterNotRemoved = (row: ISongTypeDBResult) => row.date_removed === null;

export class SongTypeService implements ISongTypeService {
	constructor(
		private readonly database: IDatabaseClient,
		private readonly shareService: IShareService,
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

	public async getAggregatedSongTypesForUser(userID: string): Promise<SongType[]> {
		const linkedLibraries = await this.shareService.getLinkedLibrariesOfUser(userID)
		const aggregatedSongTypes = await this.getSongTypesForShares(linkedLibraries.map(linkedLibrary => linkedLibrary.id))

		return uniqBy(aggregatedSongTypes, songType => `${songType.group}-${songType.name}`)
	}

	public async addSongTypeToShare(shareID: string, songType: SongType) {
		const insertQuery = makeInsertSongTypeQuery({
			share_id_ref: shareID,
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
		const deleteQuery = makeDeleteSongTypeQuery()([new Date()], [shareID, name, group]);

		await this.database.query(deleteQuery);
	}
}