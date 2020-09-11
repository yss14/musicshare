import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { testData } from "../database/seed"
import { defaultSongTypes } from "../database/fixtures"
import { SongType } from "../models/SongType"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"

const { cleanUp, getDatabase } = setupTestSuite()
let database: IDatabaseClient

const setupTest = async (args: Partial<SetupTestEnvArgs>) => {
	if (!args.database) {
		await clearTables(database)
	}

	const testEnv = await setupTestEnv({ ...args, database: args.database || database })

	return testEnv
}

beforeAll(async () => {
	database = await getDatabase()
})

afterAll(async () => {
	await cleanUp()
})

test("get song types for multiple shares", async () => {
	const { songTypeService } = await setupTest({})

	const shareIDs = [testData.shares.library_user1.share_id.toString(), testData.shares.some_share.share_id.toString()]
	const result = await songTypeService.getSongTypesForShares(shareIDs)

	expect(result).toBeArrayOfSize(defaultSongTypes.length * 2)
})

test("remove song type from share", async () => {
	const { songTypeService } = await setupTest({})

	const shareID = testData.shares.library_user1.share_id.toString()

	const songTypes = await songTypeService.getSongTypesForShare(shareID)
	const songType1 = songTypes[0]
	const songType2 = songTypes[4]
	await songTypeService.removeSongTypeFromShare(shareID, songType1.id)
	await songTypeService.removeSongTypeFromShare(shareID, songType2.id)

	const result = await songTypeService.getSongTypesForShare(shareID)

	expect(result).toBeArrayOfSize(defaultSongTypes.length - 2)
	expect(result).not.toContain(songType1)
	expect(result).not.toContain(songType2)
})
