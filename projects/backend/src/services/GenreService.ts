import { Genre } from "../models/GenreModel"
import { IDatabaseClient } from "postgres-schema-builder"
import { GenresTable, IGenreDBResult } from "../database/tables"
import { flatten, uniqBy } from "lodash"
import { IShareService } from "./ShareService"
import { IGenreWithoutID } from "../models/interfaces/Genre"
import { v4 as uuid } from "uuid"
import { ForbiddenError } from "apollo-server-core"

export class GenreNotFoundError extends ForbiddenError {
	constructor(genreID: string) {
		super(`Genre with id ${genreID} not found`)
	}
}

const selectQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(GenresTable.select("*", ["share_id_ref"])([shareID]))

const makeInsertGenreQuery = (genreObj: IGenreDBResult) => GenresTable.insertFromObj(genreObj)
const makeDeleteGenreQuery = () => GenresTable.delete(["share_id_ref", "genre_id"])

export type IGenreService = ReturnType<typeof GenreService>

export const GenreService = (database: IDatabaseClient, shareService: IShareService) => {
	const getGenreForShare = async (shareID: string, genreID: string) => {
		const dbResult = await selectQueryWithShareID(database, shareID)
		const genreResult = dbResult.find((result) => result.genre_id === genreID)

		if (!genreResult) {
			throw new GenreNotFoundError(genreID)
		}

		return Genre.fromDBResult(genreResult)
	}

	const getGenresForShare = async (shareID: string) => {
		const dbResult = await selectQueryWithShareID(database, shareID)

		return dbResult.map(Genre.fromDBResult)
	}

	const getGenresForShares = async (shareIDs: string[]): Promise<Genre[]> => {
		const dbResults = await Promise.all(shareIDs.map((shareID) => selectQueryWithShareID(database, shareID)))

		return flatten(dbResults).map(Genre.fromDBResult)
	}

	const getAggregatedGenresForUser = async (userID: string): Promise<Genre[]> => {
		const linkedLibraries = await shareService.getLinkedLibrariesOfUser(userID)
		const aggregatedGenres = await getGenresForShares(linkedLibraries.map((linkedLibrary) => linkedLibrary.id))

		return uniqBy(aggregatedGenres, (genre) => `${genre.group}-${genre.name}`)
	}

	const addGenreToShare = async (shareID: string, genre: IGenreWithoutID) => {
		const genreID = uuid()
		const insertQuery = makeInsertGenreQuery({
			genre_id: genreID,
			name: genre.name,
			group: genre.group,
			share_id_ref: shareID,
			date_added: new Date(),
			date_removed: null,
		})

		await database.query(insertQuery)

		return getGenreForShare(shareID, genreID)
	}

	const updateGenreOfShare = async (shareID: string, genreID: string, payload: IGenreWithoutID) => {
		await database.query(
			GenresTable.update(["group", "name"], ["genre_id", "share_id_ref"])(
				[payload.group, payload.name],
				[genreID, shareID],
			),
		)
	}

	const removeGenreFromShare = async (shareID: string, genreID: string) => {
		const deleteQuery = makeDeleteGenreQuery()([shareID, genreID])

		await database.query(deleteQuery)
	}

	return {
		getGenreForShare,
		getGenresForShare,
		getGenresForShares,
		getAggregatedGenresForUser,
		addGenreToShare,
		updateGenreOfShare,
		removeGenreFromShare,
	}
}
