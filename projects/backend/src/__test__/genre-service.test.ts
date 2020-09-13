import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { testData } from "../database/seed"
import { defaultGenres } from "../database/fixtures"
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

test("get genres for multiple shares", async () => {
	const { genreService } = await setupTest({})

	const shareIDs = [testData.shares.library_user1.share_id.toString(), testData.shares.some_share.share_id.toString()]
	const result = await genreService.getGenresForShares(shareIDs)

	expect(result).toBeArrayOfSize(defaultGenres.length * 2)
})

test("remove genre from share", async () => {
	const { genreService } = await setupTest({})

	const shareID = testData.shares.library_user1.share_id.toString()
	const genres = await genreService.getGenresForShare(shareID)
	const genre1 = genres[0]
	const genre2 = genres[4]
	await genreService.removeGenreFromShare(shareID, genre1.id)
	await genreService.removeGenreFromShare(shareID, genre2.id)

	const result = await genreService.getGenresForShare(shareID)

	expect(result).toBeArrayOfSize(defaultGenres.length - 2)
	expect(result).not.toContain(genre1)
	expect(result).not.toContain(genre2)
})
