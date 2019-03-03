// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql";
import { Share } from "../models/ShareModel";
import { types as CTypes } from 'cassandra-driver';
import { Song } from "../models/SongModel";
import { includesSong, compareSongs } from "./utils/compare-songs";

const makeShareQuery = (id: string, songQuery: string = '') => {
	return `
		query{
			share(id: "${id}"){
				id,
				name,
				userID,
				isLibrary,
				${songQuery}
			}
		}
	`;
}

const songKeys = `
	id,
	title,
	suffix,
	year,
	bpm,
	dateLastEdit,
	releaseDate,
	isRip,
	artists,
	remixer,
	featurings,
	type,
	genres,
	label,
	requiresUserAction,
	file{container, blob, fileExtension,originalFilename}
`;

const makeShareSongsQuery = (range?: [number, number]) => {
	return `
		songs${range ? `(from: ${range[0]} take: ${range[1]})` : ''}{
			${songKeys}
		}
	`;
}

const makeShareSongQuery = (id: string, props: string[] = []) => {
	return `
		song(id: "${id}"){
			${songKeys},
			${props.join(',')}
		}
	`;
}

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

describe('get share by id', () => {
	test('get share by id', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const query = makeShareQuery(share.id.toString());

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toEqual(makeGraphQLResponse({ share: Share.fromDBResult(share) }));
	});

	test('get share by id not existing', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const shareID = CTypes.TimeUuid.fromString('a0d8e1f0-aeb1-11e8-a117-43673ffd376a');
		const query = makeShareQuery(shareID.toString());

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ share: null },
			[{ message: `Share with id ${shareID} not found` }]
		));
	});
});

describe('get share songs', () => {
	test('get all songs of share', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const query = makeShareQuery(share.id.toString(), makeShareSongsQuery());

		const { body } = await executeGraphQLQuery(graphQLServer, query);
		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
		].map(Song.fromDBResult);

		expectedSongs.forEach(expectedSong => includesSong(body.data.share.songs, expectedSong));
	});

	test('get all songs of share with range query', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const query = makeShareQuery(share.id.toString(), makeShareSongsQuery([1, 2]));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
		].map(Song.fromDBResult);

		expectedSongs.forEach(expectedSong => includesSong(body.data.share.songs, expectedSong));
	});
});

describe('get share song', () => {
	test('get share song by id', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const song = testData.songs.song2_library_user1;
		const query = makeShareQuery(share.id.toString(), makeShareSongQuery(song.id.toString()));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		compareSongs(Song.fromDBResult(song), body.data.share.song);
	});

	test('get share song by id not existing', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const songID = CTypes.TimeUuid.fromDate(new Date());
		const query = makeShareQuery(shareID, makeShareSongQuery(songID.toString()));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body.data.share.song).toBe(null);
		expect(body.errors).toMatchObject([{ message: `Song with id ${songID} not found in share ${shareID}` }])
	});

	test('get share song by id with access url', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const song = testData.songs.song2_library_user1;
		const query = makeShareQuery(share.id.toString(), makeShareSongQuery(song.id.toString(), ['accessUrl']));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body.data.share.song).toBeDefined();
		expect(body.data.share.song.accessUrl).toBeString();
	});
});