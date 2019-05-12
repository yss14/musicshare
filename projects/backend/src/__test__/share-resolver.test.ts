import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql";
import { Share } from "../models/ShareModel";
import { shareSongFromDBResult } from "../models/SongModel";
import { includesSong, compareSongs } from "./utils/compare-songs";
import { TimeUUID } from "../types/TimeUUID";
import { defaultSongTypes, defaultGenres } from "../database/fixtures";
import { Artist } from "../models/ArtistModel";
import { songKeys } from "./fixtures/song-query";
import moment = require("moment");
import { Playlist } from "../models/PlaylistModel";
import { sortBy } from 'lodash';
import { makeMockedDatabase } from "./mocks/mock-database";
import { Permissions } from "../auth/permissions";

const makeShareQuery = (id: string, additionalQueries: string[] = []) => {
	return `
		query{
			share(shareID: "${id}"){
				id,
				name,
				userID,
				isLibrary,
				${additionalQueries.join(',\n')}
			}
		}
	`;
}

const makeShareSongsQuery = (range?: [number, number]) => {
	return `
		songs${range ? `(from: ${range[0]} take: ${range[1]})` : ''}{
			${songKeys}
		}
	`;
}

const makeShareSongsDirtyQuery = (lastTimestamp: number) => {
	return `
		songsDirty(lastTimestamp: ${lastTimestamp}){
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

const makeSharePlaylistsQuery = () => `
	playlists{
		id,
		name,
		shareID,
		dateAdded,
	}
`;

const makeSharePlaylistQuery = (playlistID: string) => `
	playlist(playlistID: "${playlistID}"){
		id,
		name,
		shareID,
		dateAdded,
	}
`;

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

describe('get share by id', () => {
	test('get share by id', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const query = makeShareQuery(share.id.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toEqual(makeGraphQLResponse({ share: Share.fromDBResult(share) }));
	});

	test('get share by id not existing', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = TimeUUID('a0d8e1f0-aeb1-11e8-a117-43673ffd376a');
		const query = makeShareQuery(shareID.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Share with id ${shareID} not found` }]
		));
	});

	test('get share by id not part of', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user2.id.toString();
		const query = makeShareQuery(shareID.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Share with id ${shareID} not found` }]
		));
	});
});

describe('get share songs', () => {
	test('get all songs of share', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const query = makeShareQuery(share.id.toString(), [makeShareSongsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
		].map(shareSongFromDBResult);

		expectedSongs.forEach(expectedSong => includesSong(body.data.share.songs, expectedSong));
	});

	test('get all songs of share with range query', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const query = makeShareQuery(share.id.toString(), [makeShareSongsQuery([1, 2])]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
		].map(shareSongFromDBResult);

		expectedSongs.forEach(expectedSong => includesSong(body.data.share.songs, expectedSong));
	});

	test('get all dirty songs', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const lastTimestamp = moment().subtract(150, 'minutes').valueOf();
		const query = makeShareQuery(share.id.toString(), [makeShareSongsDirtyQuery(lastTimestamp)]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = [
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
		].map(shareSongFromDBResult);

		const receivedSongs = body.data.share.songsDirty;
		expect(receivedSongs.length).toBe(2);
		expectedSongs.forEach(expectedSong => includesSong(receivedSongs, expectedSong));
	});
});

describe('get share song', () => {
	test('get share song by id', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const song = testData.songs.song2_library_user1;
		const query = makeShareQuery(share.id.toString(), [makeShareSongQuery(song.song_id.toString())]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		compareSongs(shareSongFromDBResult(song), body.data.share.song);
	});

	test('get share song by id not existing', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const songID = TimeUUID(new Date());
		const query = makeShareQuery(shareID, [makeShareSongQuery(songID.toString())]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.song).toBe(null);
		expect(body.errors).toMatchObject([{ message: `Song with id ${songID} not found in share ${shareID}` }])
	});

	test('get share song by id with access url', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const song = testData.songs.song2_library_user1;
		const query = makeShareQuery(share.id.toString(), [makeShareSongQuery(song.song_id.toString(), ['accessUrl'])]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.song).toBeDefined();
		expect(body.data.share.song.accessUrl).toBeString();
	});
});

describe('get share related data', () => {
	const makeShareSongTypesQuery = () => `songTypes{name,group,hasArtists,alternativeNames}`;
	const makeShareGenresQuery = () => `genres{name,group}`;
	const makeShareArtistsQuery = () => `artists{name}`;
	const makeSharePermissionsQuery = () => `permissions`;

	test('get share song types', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const query = makeShareQuery(shareID, [makeShareSongTypesQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.songTypes).toBeArrayOfSize(defaultSongTypes.length);
	});

	test('get share genres', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const query = makeShareQuery(shareID, [makeShareGenresQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.genres).toBeArrayOfSize(defaultGenres.length);
	});

	test('get share artists', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const query = makeShareQuery(shareID, [makeShareArtistsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.artists).toIncludeAllMembers([
			'Oliver Smith',
			'Natalie Holmes',
			'Kink',
			'Dusky',
			'Rue',
			'Alastor'
		].map(Artist.fromString));
	});

	test('get share permissions', async () => {
		const database = makeMockedDatabase();
		(<jest.Mock>database.query).mockReturnValue([testData.shares.library_user1])
		const { graphQLServer } = await setupTestEnv({ mockDatabase: database });
		const shareID = testData.shares.library_user1.id.toString();
		const query = makeShareQuery(shareID, [makeSharePermissionsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.permissions).toEqual(Permissions.ALL);
	});
});

describe('get share playlists', () => {
	test('all playlists', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const query = makeShareQuery(shareID, [makeSharePlaylistsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const receivedPlaylists = sortBy(body.data.share.playlists, 'name');
		const expectedPlaylists = sortBy(
			[testData.playlists.playlist1_library_user1, testData.playlists.playlist2_library_user1]
				.map(Playlist.fromDBResult)
				.map(playlist => JSON.parse(JSON.stringify(playlist)))
			, 'name');

		expect(receivedPlaylists).toEqual(expectedPlaylists);
	});

	test('get by id', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const query = makeShareQuery(shareID, [makeSharePlaylistQuery(playlistID)]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.playlist)
			.toEqual(JSON.parse(JSON.stringify(Playlist.fromDBResult(testData.playlists.playlist1_library_user1))))
	});
});

describe('get user permissions', () => {
	const makeGetUserPermissionsQuery = () => `userPermissions`;

	test('get user permissions', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const shareID = testData.shares.library_user1.id.toString();
		const query = makeShareQuery(shareID, [makeGetUserPermissionsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.userPermissions).toBeArrayOfSize(Permissions.ALL.length);
		expect(body.data.share.userPermissions).toContainAllValues(Permissions.ALL);
	});
});