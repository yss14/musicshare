import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { Artist } from "../models/ArtistModel";
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

test('get artists for multiple shares', async () => {
	const { artistService } = await setupTest({});

	const shareIDs = [testData.shares.library_user1.share_id.toString(), testData.shares.some_share.share_id.toString()];
	const result = await artistService.getArtistsForShares(shareIDs);

	expect(result).toIncludeAllMembers([
		'Oliver Smith',
		'Natalie Holmes',
		'Kink',
		'Dusky',
		'Rue',
		'Alastor',
	].map(Artist.fromString));
});