import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { defaultGenres } from "../database/fixtures";
import { Genre } from "../models/GenreModel";

const setupLocalTestEnv = async () => {
	const { cleanUp, ...testEnv } = await setupTestEnv();
	cleanupHooks.push(cleanUp);

	return testEnv;
}

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('get genres for multiple shares', async () => {
	const { genreService } = await setupLocalTestEnv();

	const shareIDs = [testData.shares.library_user1.id.toString(), testData.shares.some_shared_library.id.toString()];
	const result = await genreService.getGenresForShares(shareIDs);

	expect(result).toBeArrayOfSize(defaultGenres.length * 2);
});

test('remove genre from share', async () => {
	const { genreService } = await setupLocalTestEnv();

	const shareID = testData.shares.library_user1.id.toString();
	await genreService.removeGenreFromShare(shareID, Genre.fromObject(defaultGenres[4]));
	await genreService.removeGenreFromShare(shareID, Genre.fromObject(defaultGenres[9]));

	const result = await genreService.getGenresForShare(shareID);

	expect(result).toBeArrayOfSize(defaultGenres.length - 2);
});