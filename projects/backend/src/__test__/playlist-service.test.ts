import { setupTestEnv } from "./utils/setup-test-env";
import { TimeUUID } from "../types/TimeUUID";
import { PlaylistNotFoundError } from "../services/PlaylistService";
import { testData } from "../database/seed";

const setupTest = async () => {
	const { graphQLServer, cleanUp, ...testEnv } = await setupTestEnv({});
	cleanupHooks.push(cleanUp);

	return { graphQLServer, ...testEnv };
}

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

describe('get playlist by id', () => {
	test('not found', async () => {
		const { playlistService } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();

		await expect(playlistService.getByID(shareID, TimeUUID().toString()))
			.rejects.toThrowError(PlaylistNotFoundError);
	});
});