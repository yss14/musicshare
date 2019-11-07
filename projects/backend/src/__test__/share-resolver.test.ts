import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql";
import { Share } from "../models/ShareModel";
import { includesSong, compareSongs } from "./utils/compare-songs";
import { v4 as uuid } from 'uuid';
import { songKeys } from "./fixtures/song-query";
import moment = require("moment");
import { makeMockedDatabase } from "./mocks/mock-database";
import { Permissions } from "../auth/permissions";
import { IDatabaseClient } from "postgres-schema-builder";
import { clearTables } from "../database/schema/make-database-schema";
import { Song } from "../models/SongModel";

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

const makeShareQuery = (id: string, additionalQueries: string[] = []) => {
	return `
		query{
			share(shareID: "${id}"){
				id,
				name,
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

const makeSharePlaylistQuery = (playlistID: string, fields: string[] = []) => `
	playlist(playlistID: "${playlistID}"){
		id,
		name,
		shareID,
		dateAdded,
		${fields.join(',\n')}
	}
`;

const makeCreateShareMutation = (name: string) => `
	mutation{
		createShare(name: "${name}"){
			id,
			name,
			permissions
		}
	}
`;

describe('get share by id', () => {
	test('get share by id', async () => {
		const { graphQLServer } = await setupTest({});

		const share = testData.shares.library_user1;
		const query = makeShareQuery(share.share_id.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toEqual(makeGraphQLResponse({ share: Share.fromDBResult(share) }));
	});

	test('get share by id not existing', async () => {
		const { graphQLServer } = await setupTest({});

		const shareID = uuid();
		const query = makeShareQuery(shareID.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Share with id ${shareID} not found` }]
		));
	});

	test('get share by id not part of', async () => {
		const { graphQLServer } = await setupTest({});

		const shareID = testData.shares.library_user2.share_id.toString();
		const query = makeShareQuery(shareID.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Share with id ${shareID} not found` }]
		));
	});
});

describe('get share songs', () => {
	const shareID = testData.shares.library_user1.share_id;

	test('get all songs of library', async () => {
		const { graphQLServer } = await setupTest({});

		const library = testData.shares.library_user1;
		const query = makeShareQuery(library.share_id.toString(), [makeShareSongsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
		].map(result => Song.fromDBResult(result, shareID));

		expectedSongs.forEach(expectedSong => includesSong(body.data.share.songs, expectedSong));
	});

	test('get all songs of library with range query', async () => {
		const { graphQLServer } = await setupTest({});

		const library = testData.shares.library_user1;
		const query = makeShareQuery(library.share_id.toString(), [makeShareSongsQuery([1, 2])]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
		].map(result => Song.fromDBResult(result, shareID));

		expectedSongs.forEach(expectedSong => includesSong(body.data.share.songs, expectedSong));
	});

	test('get all dirty songs', async () => {
		const { graphQLServer } = await setupTest({});

		const library = testData.shares.library_user1;
		const lastTimestamp = moment().subtract(150, 'minutes').valueOf();
		const query = makeShareQuery(library.share_id.toString(), [makeShareSongsDirtyQuery(lastTimestamp)]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = [
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
		].map(result => Song.fromDBResult(result, shareID));

		const receivedSongs = body.data.share.songsDirty;
		expect(receivedSongs.length).toBe(2);
		expectedSongs.forEach(expectedSong => includesSong(receivedSongs, expectedSong));
	});

	test('get all songs of a share', async () => {
		const { graphQLServer } = await setupTest({});

		const share = testData.shares.some_shared_library;
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		const expectedShareIDs = [
			testData.shares.library_user1.share_id,
			testData.shares.library_user1.share_id,
			testData.shares.library_user1.share_id,
			testData.shares.library_user2.share_id
		]
		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
			testData.songs.song4_library_user2,
		].map((result, idx) => Song.fromDBResult(result, expectedShareIDs[idx]));

		expectedSongs.forEach(expectedSong => includesSong(body.data.share.songs, expectedSong));
	});
});

describe('get share song', () => {
	test('get share song by id', async () => {
		const { graphQLServer } = await setupTest({});

		const share = testData.shares.library_user1;
		const song = testData.songs.song2_library_user1;
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongQuery(song.song_id.toString())]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		compareSongs(Song.fromDBResult(song, share.share_id), body.data.share.song);
	});

	test('get share song by id not existing', async () => {
		const { graphQLServer } = await setupTest({});

		const shareID = testData.shares.library_user1.share_id.toString();
		const songID = uuid();
		const query = makeShareQuery(shareID, [makeShareSongQuery(songID.toString())]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.song).toBe(null);
		expect(body.errors).toMatchObject([{ message: `Song with id ${songID} not found in share ${shareID}` }])
	});

	test('get share song by id with access url', async () => {
		const { graphQLServer } = await setupTest({});

		const share = testData.shares.library_user1;
		const song = testData.songs.song2_library_user1;
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongQuery(song.song_id.toString(), ['accessUrl'])]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.song).toBeDefined();
		expect(body.data.share.song.accessUrl).toBeString();
	});

	test('get share song via proxy from linked share succeeds', async () => {
		const { graphQLServer } = await setupTest({});

		const share = testData.shares.some_shared_library;
		const song = testData.songs.song4_library_user2;
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongQuery(song.song_id.toString())]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.song).not.toBeNull();
		compareSongs(Song.fromDBResult(song, testData.shares.library_user2.share_id), body.data.share.song);
	})

	test('get share song via proxy from unrelated share fails', async () => {
		const { graphQLServer } = await setupTest({});

		const share = testData.shares.some_unrelated_library;
		const song = testData.songs.song5_library_user3;
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongQuery(song.song_id.toString())]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.errors).toMatchObject([{ message: `Share with id ${share.share_id} not found` }])
	})
});

describe('get share related data', () => {
	const makeSharePermissionsQuery = () => `permissions`;

	test('get share permissions', async () => {
		const database = makeMockedDatabase();
		(<jest.Mock>database.query).mockReturnValue([testData.shares.library_user1])
		const { graphQLServer } = await setupTest({ database });
		const shareID = testData.shares.library_user1.share_id.toString();
		const query = makeShareQuery(shareID, [makeSharePermissionsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.permissions).toEqual(Permissions.ALL);
	});
});

describe('get share playlists', () => {
	test('all playlists', async () => {
		const { graphQLServer } = await setupTest({});

		const shareID = testData.shares.library_user1.share_id.toString();
		const query = makeShareQuery(shareID, [makeSharePlaylistsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedPlaylists = [testData.playlists.playlist1_library_user1, testData.playlists.playlist2_library_user1]
			.map(playlist => ({
				id: playlist.playlist_id,
				name: playlist.name,
			}));

		expect(body.data.share.playlists).toMatchObject(expectedPlaylists);
	});

	test('get by id', async () => {
		const { graphQLServer } = await setupTest({});

		const shareID = testData.shares.library_user1.share_id.toString();
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeShareQuery(shareID, [makeSharePlaylistQuery(playlistID)]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedPlaylist = testData.playlists.playlist1_library_user1;
		expect(body.data.share.playlist).toMatchObject({
			id: expectedPlaylist.playlist_id,
			name: expectedPlaylist.name,
		});
	});

	test('get playlist songs', async () => {
		const { graphQLServer } = await setupTest({});

		const shareID = testData.shares.library_user1.share_id.toString();
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeShareQuery(shareID, [makeSharePlaylistQuery(playlistID, [`songs{${songKeys}}`])]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		const receivedSongs = body.data.share.playlist.songs;
		const expectedSongs = testData.playlists.playlist1_library_user1.songs.map((song, idx) => Song.fromDBResult({
			...song,
			date_added: new Date(),
			date_removed: null,
		}, shareID));

		expect(receivedSongs).toBeArrayOfSize(testData.playlists.playlist1_library_user1.songs.length);
		expectedSongs.forEach(expectedSong => includesSong(receivedSongs, expectedSong));
	});
});

describe('get user permissions', () => {
	const makeGetUserPermissionsQuery = () => `userPermissions`;

	test('get user permissions', async () => {
		const { graphQLServer } = await setupTest({});

		const shareID = testData.shares.library_user1.share_id.toString();
		const query = makeShareQuery(shareID, [makeGetUserPermissionsQuery()]);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.share.userPermissions).toBeArrayOfSize(Permissions.ALL.length);
		expect(body.data.share.userPermissions).toContainAllValues(Permissions.ALL);
	});
});

describe('create share', () => {
	test('valid share', async () => {
		const { graphQLServer } = await setupTest({});

		const newShareName = "New Share";
		const query = makeCreateShareMutation(newShareName);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.createShare.permissions).toBeArrayOfSize(Permissions.ALL.length);
		expect(body.data.createShare.name).toEqual(newShareName);
	});

	test('invalid share name', async () => {
		const { graphQLServer } = await setupTest({});

		const query = makeCreateShareMutation("");
		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.createShare).toBe(null);
		expect(body.errors).toMatchObject([{ message: "Argument Validation Error" }])
	});
});