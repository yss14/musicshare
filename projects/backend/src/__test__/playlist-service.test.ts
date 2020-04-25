import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { v4 as uuid } from "uuid"
import { PlaylistNotFoundError } from "../services/PlaylistService"
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

describe("get playlist by id", () => {
	test("not found", async () => {
		const { playlistService } = await setupTest({})
		const shareID = testData.shares.library_user1.share_id.toString()

		await expect(playlistService.getByID(shareID, uuid())).rejects.toThrowError(PlaylistNotFoundError)
	})
})
