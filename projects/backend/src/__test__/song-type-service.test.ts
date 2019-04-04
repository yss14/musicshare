import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { defaultSongTypes } from "../database/fixtures";

const setupLocalTestEnv = async () => {
	const { cleanUp, ...testEnv } = await setupTestEnv();
	cleanupHooks.push(cleanUp);

	return testEnv;
}

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('get song types for multiple shares', async () => {
	const { songTypeService } = await setupLocalTestEnv();

	const shareIDs = [testData.shares.library_user1.id.toString(), testData.shares.some_shared_library.id.toString()];
	const result = await songTypeService.getSongTypesForShares(shareIDs);

	expect(result).toBeArrayOfSize(defaultSongTypes.length * 2);
});

test('remove song type from share', async () => {
	const { songTypeService } = await setupLocalTestEnv();

	const shareID = testData.shares.library_user1.id.toString();
	await songTypeService.removeSongTypeFromShare(shareID, defaultSongTypes[4]);
	await songTypeService.removeSongTypeFromShare(shareID, defaultSongTypes[9]);

	const result = await songTypeService.getSongTypesForShare(shareID);

	expect(result).toBeArrayOfSize(defaultSongTypes.length - 2);
});