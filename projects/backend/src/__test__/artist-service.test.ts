import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { Artist } from "../models/ArtistModel";

const setupLocalTestEnv = async () => {
	const { cleanUp, ...testEnv } = await setupTestEnv();
	cleanupHooks.push(cleanUp);

	return testEnv;
}

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('get artists for multiple shares', async () => {
	const { artistService } = await setupLocalTestEnv();

	const shareIDs = [testData.shares.library_user1.id.toString(), testData.shares.some_shared_library.id.toString()];
	const result = await artistService.getArtistsForShares(shareIDs);

	expect(result).toIncludeAllMembers([
		'Oliver Smith',
		'Natalie Holmes',
		'Kink',
		'Dusky',
		'Rue',
		'Alastor',
		'Marsh'
	].map(Artist.fromString));
});