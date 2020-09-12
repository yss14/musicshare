import { IDatabaseClient } from "postgres-schema-builder"
import { SongType } from "../models/SongType"
import { flatten, uniqBy } from "lodash"
import { SongTypesTable, ISongTypeDBResult } from "../database/tables"
import { IShareService } from "./ShareService"
import { ISongTypeWithoutID } from "../models/interfaces/SongType"
import { v4 as uuid } from "uuid"

const selectQueryWithShareID = (database: IDatabaseClient, shareID: string) =>
	database.query(SongTypesTable.select("*", ["share_id_ref"])([shareID]))

const makeInsertSongTypeQuery = (songTypeObj: ISongTypeDBResult) => SongTypesTable.insertFromObj(songTypeObj)
const makeDeleteSongTypeQuery = () => SongTypesTable.delete(["share_id_ref", "song_type_id"])

const filterNotRemoved = (row: ISongTypeDBResult) => row.date_removed === null

export type ISongTypeService = ReturnType<typeof SongTypeService>

export const SongTypeService = (database: IDatabaseClient, shareService: IShareService) => {
	const getSongTypesForShare = async (shareID: string) => {
		const dbResult = await selectQueryWithShareID(database, shareID)

		return dbResult.filter(filterNotRemoved).map(SongType.fromDBResult)
	}

	const getSongTypesForShares = async (shareIDs: string[]) => {
		const dbResults = await Promise.all(shareIDs.map((shareID) => selectQueryWithShareID(database, shareID)))

		return flatten(dbResults).filter(filterNotRemoved).map(SongType.fromDBResult)
	}

	const getAggregatedSongTypesForUser = async (userID: string): Promise<SongType[]> => {
		const linkedLibraries = await shareService.getLinkedLibrariesOfUser(userID)
		const aggregatedSongTypes = await getSongTypesForShares(
			linkedLibraries.map((linkedLibrary) => linkedLibrary.id),
		)

		return uniqBy(aggregatedSongTypes, (songType) => `${songType.group}-${songType.name}`)
	}

	const addSongTypeToShare = async (shareID: string, songType: ISongTypeWithoutID) => {
		const insertQuery = makeInsertSongTypeQuery({
			song_type_id: uuid(),
			share_id_ref: shareID,
			name: songType.name,
			group: songType.group,
			alternative_names: songType.alternativeNames || null,
			has_artists: songType.hasArtists,
			date_added: new Date(),
			date_removed: null,
		})

		await database.query(insertQuery)
	}

	const removeSongTypeFromShare = async (shareID: string, songTypeID: string) => {
		const deleteQuery = makeDeleteSongTypeQuery()([shareID, songTypeID])

		await database.query(deleteQuery)
	}

	return {
		getSongTypesForShare,
		getSongTypesForShares,
		getAggregatedSongTypesForUser,
		addSongTypeToShare,
		removeSongTypeFromShare,
	}
}
