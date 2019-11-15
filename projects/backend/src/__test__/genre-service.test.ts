import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { defaultGenres } from "../database/fixtures";
import { Genre } from "../models/GenreModel";
import { IDatabaseClient } from "postgres-schema-builder";
import { clearTables } from "../database/schema/make-database-schema";

const { cleanUp, getDatabase } = setupTestSuite();
let database: IDatabaseClient;

const setupTest = async (args: Partial<SetupTestEnvArgs>) => {
	if (!args.database) {
		await clearTables(database);
	}

	const testEnv = await setupTestEnv({ ...args, database: args.database || database });

	return testEnv;
}

beforeAll(async () => {
	database = await getDatabase();
});

afterAll(async () => {
	await cleanUp();
});

test('get genres for multiple shares', async () => {
	const { genreService } = await setupTest({});

	const shareIDs = [testData.shares.library_user1.share_id.toString(), testData.shares.some_share.share_id.toString()];
	const result = await genreService.getGenresForShares(shareIDs);

	expect(result).toBeArrayOfSize(defaultGenres.length * 2);
});

test('remove genre from share', async () => {
	const { genreService } = await setupTest({});

	const shareID = testData.shares.library_user1.share_id.toString();
	await genreService.removeGenreFromShare(shareID, Genre.fromObject(defaultGenres[4]));
	await genreService.removeGenreFromShare(shareID, Genre.fromObject(defaultGenres[9]));

	const result = await genreService.getGenresForShare(shareID);

	expect(result).toBeArrayOfSize(defaultGenres.length - 2);
});