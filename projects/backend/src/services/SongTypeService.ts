import { IDatabaseClient } from "postgres-schema-builder"
import { SongType } from "../models/SongType"
import { flatten, uniqBy } from "lodash"
import { SongTypesTable, ISongTypeDBResult } from "../database/tables"
import { IShareService } from "./ShareService"
import { ISongTypeWithoutID } from "../models/interfaces/SongType"
import { v4 as uuid } from "uuid"
import { ForbiddenError } from "apollo-server-core"

export class SongTypeNotFoundError extends ForbiddenError {
	constructor(songTypeID: string) {
		super(`SongType with id ${songTypeID} not found`)
	}
}

const selectQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(SongTypesTable.select("*", ["share_id_ref"])([shareID]))

const makeInsertSongTypeQuery = (songTypeObj: ISongTypeDBResult) => SongTypesTable.insertFromObj(songTypeObj)
const makeDeleteSongTypeQuery = () => SongTypesTable.delete(["share_id_ref", "song_type_id"])

export type ISongTypeService = ReturnType<typeof SongTypeService>

export const SongTypeService = (database: IDatabaseClient, shareService: IShareService) => {
	const getSongTypeForShare = async (shareID: string, songTypeID: string) => {
		const dbResult = await selectQueryWithShareID(database, shareID)
		const songTypeResult = dbResult.find((result) => result.song_type_id === songTypeID)

		if (!songTypeResult) {
			throw new SongTypeNotFoundError(songTypeID)
		}

		return SongType.fromDBResult(songTypeResult)
	}

	const getSongTypesForShare = async (shareID: string) => {
		const dbResult = await selectQueryWithShareID(database, shareID)

		return dbResult.map(SongType.fromDBResult)
	}

	const getSongTypesForShares = async (shareIDs: string[]) => {
		const dbResults = await Promise.all(shareIDs.map((shareID) => selectQueryWithShareID(database, shareID)))

		return flatten(dbResults).map(SongType.fromDBResult)
	}

	const getAggregatedSongTypesForUser = async (userID: string): Promise<SongType[]> => {
		const linkedLibraries = await shareService.getLinkedLibrariesOfUser(userID)
		const aggregatedSongTypes = await getSongTypesForShares(
			linkedLibraries.map((linkedLibrary) => linkedLibrary.id),
		)

		return uniqBy(aggregatedSongTypes, (songType) => `${songType.group}-${songType.name}`)
	}

	const addSongTypeToShare = async (shareID: string, songType: ISongTypeWithoutID) => {
		const songTypeID = uuid()
		const insertQuery = makeInsertSongTypeQuery({
			song_type_id: songTypeID,
			share_id_ref: shareID,
			name: songType.name,
			group: songType.group,
			alternative_names: songType.alternativeNames || null,
			has_artists: songType.hasArtists,
			date_added: new Date(),
			date_removed: null,
		})

		await database.query(insertQuery)

		return getSongTypeForShare(shareID, songTypeID)
	}

	const updateSongTypeOfShare = async (shareID: string, songTypeID: string, payload: ISongTypeWithoutID) => {
		await database.query(
			SongTypesTable.update(
				["group", "name", "alternative_names", "has_artists"],
				["song_type_id", "share_id_ref"],
			)(
				[payload.group, payload.name, payload.alternativeNames || null, payload.hasArtists],
				[songTypeID, shareID],
			),
		)
	}

	const removeSongTypeFromShare = async (shareID: string, songTypeID: string) => {
		const deleteQuery = makeDeleteSongTypeQuery()([shareID, songTypeID])

		await database.query(deleteQuery)
	}

	return {
		getSongTypeForShare,
		getSongTypesForShare,
		getSongTypesForShares,
		getAggregatedSongTypesForUser,
		addSongTypeToShare,
		updateSongTypeOfShare,
		removeSongTypeFromShare,
	}
}
