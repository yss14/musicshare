import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { testData } from "../database/seed"
import { Artist } from "../models/ArtistModel"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { ISongDBResult } from "../database/tables"

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

const pickArtists = (song: ISongDBResult) => [
	...(song.artists || []),
	...(song.remixer || []),
	...(song.featurings || []),
]

test("get artists for multiple shares", async () => {
	const { artistService } = await setupTest({})

	const shareIDs = [testData.shares.library_user1.share_id.toString(), testData.shares.some_share.share_id.toString()]
	const result = await artistService.getArtistsForShares(shareIDs)

	const expectedArtists = Array.from(
		new Set([
			...pickArtists(testData.songs.song1_library_user1),
			...pickArtists(testData.songs.song2_library_user1),
			...pickArtists(testData.songs.song3_library_user1),
			...pickArtists(testData.songs.song4_library_user2),
		]),
	)

	expect(result).toIncludeAllMembers(expectedArtists.map(Artist.fromString))
})
