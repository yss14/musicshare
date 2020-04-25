import { clearTables } from "../database/database"
import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { testData, createTestSongs } from "../database/seed"

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

describe("addLibrarySongsToShare", () => {
	test("add library with 500 songs to share does not block", async () => {
		const { songService } = await setupTest({})

		const shareID = testData.shares.some_unrelated_share.share_id
		const libraryID = testData.shares.library_user1.share_id

		const songInserts = createTestSongs(500)
		for (const songInsert of songInserts) {
			await songService.create(libraryID, songInsert)
		}

		const shareSongsBefore = await songService.getByShare(shareID)
		const librarySongs = await songService.getByShare(libraryID)

		await songService.addLibrarySongsToShare(shareID, libraryID)

		const shareSongsAfter = await songService.getByShare(shareID)

		expect(shareSongsAfter.length).toBe(shareSongsBefore.length + librarySongs.length)
	}, 50000)
})
