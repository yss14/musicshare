import { Genre } from "../models/GenreModel";
import { IDatabaseClient } from "cassandra-schema-builder";
import { GenresByShareTable, IGenreByShareDBResult } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";
import { flatten } from "lodash";

export interface IGenreService {
	getGenresForShare(shareID: string): Promise<Genre[]>;
	getGenresForShares(shareIDs: string[]): Promise<Genre[]>;

	addGenreToShare(shareID: string, genre: Genre): Promise<void>;
	removeGenreFromShare(shareID: string, genre: Genre): Promise<void>;
}

const selectQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(GenresByShareTable.select('*', ['share_id'])([TimeUUID(shareID)]));

const makeInsertSongTypeQuery = (genreObj: IGenreByShareDBResult) => GenresByShareTable.insertFromObj(genreObj);
const makeDeleteSongTypeQuery = () =>
	GenresByShareTable.update(['date_removed'], ['share_id', 'name', 'group']);

const filterNotRemoved = (row: IGenreByShareDBResult) => row.date_removed === null;

export class GenreService implements IGenreService {
	constructor(
		private readonly database: IDatabaseClient,
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

	public async addGenreToShare(shareID: string, genre: Genre) {
		const insertQuery = makeInsertSongTypeQuery({
			name: genre.name,
			group: genre.group,
			share_id: TimeUUID(shareID),
			date_added: new Date(),
			date_removed: null,
		});

		await this.database.query(insertQuery);
	}

	public async removeGenreFromShare(shareID: string, genre: Genre) {
		const { name, group } = genre;
		const deleteQuery = makeDeleteSongTypeQuery()([new Date()], [TimeUUID(shareID), name, group]);

		await this.database.query(deleteQuery);
	}
}