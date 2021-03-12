import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { testData } from "../database/seed"
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

test("get tags for multiple shares", async () => {
	const { tagService } = await setupTest({})

	const shareIDs = [testData.shares.library_user1.share_id.toString(), testData.shares.some_share.share_id.toString()]
	const result = await tagService.getTagsForShares(shareIDs)

	const expectedTags = Array.from(
		new Set([
			...(testData.songs.song1_library_user1.tags || []),
			...(testData.songs.song2_library_user1.tags || []),
			...(testData.songs.song3_library_user1.tags || []),
			...(testData.songs.song4_library_user2.tags || []),
		]),
	)

	expect(result).toBeArrayOfSize(expectedTags.length)
	expect(result).toIncludeAllMembers(expectedTags)
})
