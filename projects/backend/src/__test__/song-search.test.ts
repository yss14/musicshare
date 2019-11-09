import { clearTables } from "../database/schema/make-database-schema";
import { setupTestSuite, SetupTestEnvArgs, setupTestEnv } from "./utils/setup-test-env";
import { IDatabaseClient } from "postgres-schema-builder";
import { SongSearchMatcher } from "../inputs/SongSearchInput";
import { testData, songContactAlastor, songPerthDusky, songZeroOliverSmith, songIsItLove } from "../database/seed";
import { Song } from "../models/SongModel";
import { compareSongs, includesSong } from "./utils/compare-songs";
import { songKeys } from "./fixtures/song-query";
import { executeGraphQLQuery, makeGraphQLResponse, argumentValidationError } from "./utils/graphql";

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

const allMatchers = Object.values(SongSearchMatcher)
const allMatcherKeys = Object.keys(SongSearchMatcher)

describe('service', () => {
	const userID = testData.users.user1.user_id
	const shareID = testData.shares.library_user1.share_id

	test('all matchers single token query', async () => {
		const { songService } = await setupTest({})

		const songs = await songService.searchSongs(userID, 'cOntaCt', allMatchers)
		const expectedSong = Song.fromDBResult(songContactAlastor, shareID)

		expect(songs).toBeArrayOfSize(1)
		compareSongs(expectedSong, songs[0])
	})

	test('all matchers two token query', async () => {
		const { songService } = await setupTest({})

		const songs = await songService.searchSongs(userID, 'Deep Perth', allMatchers)
		const expectedSongs = [
			Song.fromDBResult(songPerthDusky, shareID),
			Song.fromDBResult(songContactAlastor, shareID),
		]

		expect(songs).toBeArrayOfSize(expectedSongs.length)
		expectedSongs.forEach(expectedSong => includesSong(songs, expectedSong))
	})

	test('all matchers four token query', async () => {
		const { songService } = await setupTest({})

		const songs = await songService.searchSongs(userID, 'Zero Oliver Smith Anjuna', allMatchers)
		const expectedSongs = [
			Song.fromDBResult(songZeroOliverSmith, shareID),
			Song.fromDBResult(songPerthDusky, shareID),
			Song.fromDBResult(songContactAlastor, shareID),
			Song.fromDBResult(songIsItLove, testData.shares.library_user2.share_id),
		]

		expect(songs).toBeArrayOfSize(expectedSongs.length)
		expectedSongs.forEach(expectedSong => includesSong(songs, expectedSong))
	})

	test('single matchers two token query', async () => {
		const { songService } = await setupTest({})

		const songs = await songService.searchSongs(userID, 'Dusky', [SongSearchMatcher.Artists])
		const expectedSong = Song.fromDBResult(songPerthDusky, shareID)

		expect(songs).toBeArrayOfSize(1)
		compareSongs(expectedSong, songs[0])
	})

	test('only special chars', async () => {
		const { songService } = await setupTest({})

		await expect(songService.searchSongs(userID, '?? &% $$!', [SongSearchMatcher.Artists]))
			.rejects.toThrowError('Search query is empty. Only special chars are not a valid search query.')
	})
})

describe.only('resolver', () => {
	const makeSearchQuery = (query: string, matchers: string[] = allMatcherKeys) => `
		query {
			viewer {
				searchSongs(query: "${query}" matcher: [${matchers.join(', ')}]) {
					${songKeys}
				}
			}
		}
	`

	test('all matchers four token query', async () => {
		const { graphQLServer } = await setupTest({})
		const query = makeSearchQuery('Is it love Gabriel & Dresden')

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data).not.toBeNull()
		expect(body.data.viewer.searchSongs.length).toBeGreaterThanOrEqual(1)
		compareSongs(Song.fromDBResult(songIsItLove, testData.shares.library_user2.share_id), body.data.viewer.searchSongs[0])
	})

	test('query too short', async () => {
		const { graphQLServer } = await setupTest({})
		const query = makeSearchQuery('I')

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(
			{ viewer: null },
			[{ message: `Argument Validation Error` }]
		))
	})

	test('invalid matcher', async () => {
		const { graphQLServer } = await setupTest({})
		const query = makeSearchQuery('Im super', ['BPM'])

		const { body } = await executeGraphQLQuery({ graphQLServer, query, expectedHTTPCode: 400 })

		expect(body).toMatchObject(argumentValidationError(
			`Expected type SongSearchMatcher, found BPM.`
		))
	})
})