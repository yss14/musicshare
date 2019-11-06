import { Genre } from "../models/GenreModel";
import { IDatabaseClient } from "postgres-schema-builder";
import { GenresTable, IGenreDBResult } from "../database/schema/tables";
import { flatten, uniqBy } from "lodash";
import { IShareService } from "./ShareService";

export interface IGenreService {
	getGenresForShare(shareID: string): Promise<Genre[]>;
	getGenresForShares(shareIDs: string[]): Promise<Genre[]>;
	getAggregatedGenresForUser(userID: string): Promise<Genre[]>;

	addGenreToShare(shareID: string, genre: Genre): Promise<void>;
	removeGenreFromShare(shareID: string, genre: Genre): Promise<void>;
}

const selectQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(GenresTable.select('*', ['share_id_ref'])([shareID]));

const makeInsertSongTypeQuery = (genreObj: IGenreDBResult) => GenresTable.insertFromObj(genreObj);
const makeDeleteSongTypeQuery = () =>
	GenresTable.update(['date_removed'], ['share_id_ref', 'name', 'group']);

const filterNotRemoved = (row: IGenreDBResult) => row.date_removed === null;

export class GenreService implements IGenreService {
	constructor(
		private readonly database: IDatabaseClient,
		private readonly shareService: IShareService,
	) { }

	public async getGenresForShare(shareID: string) {
		const dbResult = await selectQueryWithShareID(this.database, shareID);

		return dbResult
			.filter(filterNotRemoved)
			.map(Genre.fromDBResult);
	}

	public async getGenresForShares(shareIDs: string[]): Promise<Genre[]> {
		const dbResults = await Promise.all(shareIDs.map(shareID => selectQueryWithShareID(this.database, shareID)));

		return flatten(dbResults)
			.filter(filterNotRemoved)
			.map(Genre.fromDBResult);
	}

	public async getAggregatedGenresForUser(userID: string): Promise<Genre[]> {
		const linkedLibraries = await this.shareService.getLinkedLibrariesOfUser(userID)
		const aggregatedGenres = await this.getGenresForShares(linkedLibraries.map(linkedLibrary => linkedLibrary.id))

		return uniqBy(aggregatedGenres, genre => `${genre.group}-${genre.name}`)
	}

	public async addGenreToShare(shareID: string, genre: Genre) {
		const insertQuery = makeInsertSongTypeQuery({
			name: genre.name,
			group: genre.group,
			share_id_ref: shareID,
			date_added: new Date(),
			date_removed: null,
		});

		await this.database.query(insertQuery);
	}

	public async removeGenreFromShare(shareID: string, genre: Genre) {
		const { name, group } = genre;
		const deleteQuery = makeDeleteSongTypeQuery()([new Date()], [shareID, name, group]);

		await this.database.query(deleteQuery);
	}
}