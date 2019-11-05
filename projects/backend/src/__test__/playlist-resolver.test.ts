import { setupTestEnv, SetupTestEnvArgs, setupTestSuite } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery, argumentValidationError, makeGraphQLResponse, insufficientPermissionsError } from "./utils/graphql";
import moment = require("moment");
import { songKeys } from "./fixtures/song-query";
import { includesSong } from "./utils/compare-songs";
import { OrderUpdate } from "../services/PlaylistService";
import { sortBy } from 'lodash';
import { makeMockedDatabase } from "./mocks/mock-database";
import { Scopes } from "../types/context";
import { IDatabaseClient } from "postgres-schema-builder";
import { clearTables } from "../database/schema/make-database-schema";
import { Song } from "../models/SongModel";
import { v4 as uuid } from 'uuid';

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

const makeMockDatabase = () => {
	const mockDatabase = makeMockedDatabase();
	(<jest.Mock>mockDatabase.query).mockReturnValue([testData.playlists.playlist1_library_user1]);

	return mockDatabase;
}

const makeMutation = (mutation: string) => `mutation{${mutation}}`;

describe('create playlist', () => {
	const makeCreatePlaylistMutation = (shareID: string, name: string) => `
		createPlaylist(shareID: "${shareID}", name: "${name}"){id, name, shareID, dateAdded}
	`;
	const shareID = testData.shares.library_user1.share_id.toString();

	test('valid playlist name', async () => {
		const { graphQLServer } = await setupTest({});
		const name = 'A new playlist';
		const dateBeforeInsert = moment();
		const query = makeMutation(makeCreatePlaylistMutation(shareID, name));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const mutationResult = body.data.createPlaylist;
		expect(mutationResult).toMatchObject({ name, shareID });
		expect(moment(mutationResult.dateAdded).isAfter(dateBeforeInsert)).toBeTrue();
		expect(mutationResult.id).toBeUUID();
	});

	test('invalid playlist name', async () => {
		const { graphQLServer } = await setupTest({});
		const query = makeMutation(makeCreatePlaylistMutation(shareID, 'S'));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(argumentValidationError());
	});

	test('playlist already existing name', async () => {
		const { graphQLServer } = await setupTest({});
		const name = testData.playlists.playlist1_library_user1.name;
		const dateBeforeInsert = moment();
		const query = makeMutation(makeCreatePlaylistMutation(shareID, name));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const mutationResult = body.data.createPlaylist;
		expect(mutationResult).toMatchObject({ name, shareID });
		expect(moment(mutationResult.dateAdded).isAfter(dateBeforeInsert)).toBeTrue();
		expect(mutationResult.id).toBeUUID();
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTest({ database: makeMockDatabase() });
		const query = makeMutation(makeCreatePlaylistMutation(shareID, 'Some playlist'));
		const scopes: Scopes = [{ shareID, permissions: ['playlist:modify', 'playlist:mutate_songs'] }];

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes });

		expect(body).toMatchObject(insufficientPermissionsError());
	});
});

describe('delete playlist', () => {
	const makeDeletePlaylistMutation = (shareID: string, playlistID: string) => `
		deletePlaylist(shareID: "${shareID}", playlistID: "${playlistID}")
	`;
	const shareID = testData.shares.library_user1.share_id.toString();

	test('existing playlist', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeMutation(makeDeletePlaylistMutation(shareID, playlistID));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toEqual(makeGraphQLResponse({ deletePlaylist: true }));
	});

	test('not existing playlist', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = uuid();
		const query = makeMutation(makeDeletePlaylistMutation(shareID, playlistID));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Playlist with id ${playlistID} not found` }]));
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTest({ database: makeMockDatabase() });
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeMutation(makeDeletePlaylistMutation(shareID, playlistID));
		const scopes: Scopes = [{ shareID, permissions: ['playlist:create', 'playlist:mutate_songs'] }];

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes });

		expect(body).toMatchObject(insufficientPermissionsError());
	});
});

describe('rename playlist', () => {
	const makeRenamePlaylistQuery = (shareID: string, playlistID: string, newName: string) => `
		renamePlaylist(shareID: "${shareID}", playlistID: "${playlistID}", newName: "${newName}")
	`;
	const shareID = testData.shares.library_user1.share_id.toString();

	test('existing playlist', async () => {
		const { graphQLServer, playlistService } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const newName = 'Some new playlist name';
		const query = makeMutation(makeRenamePlaylistQuery(shareID, playlistID, newName));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toEqual(makeGraphQLResponse({ renamePlaylist: true }));

		const playlist = await playlistService.getByID(shareID, playlistID);
		expect(playlist).toMatchObject({ id: playlistID, name: newName });
	});

	test('not existing playlist', async () => {
		const { graphQLServer, playlistService } = await setupTest({});
		const playlistID = uuid();
		const newName = 'Some new playlist name';
		const query = makeMutation(makeRenamePlaylistQuery(shareID, playlistID, newName));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Playlist with id ${playlistID} not found` }]));

		const playlists = await playlistService.getPlaylistsForShare(shareID);
		expect(playlists).toBeArrayOfSize(2);
	});

	test('invalid new name', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeMutation(makeRenamePlaylistQuery(shareID, playlistID, 'S'));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(argumentValidationError());
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTest({ database: makeMockDatabase() });
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeMutation(makeRenamePlaylistQuery(shareID, playlistID, 'Some new name'));
		const scopes: Scopes = [{ shareID, permissions: ['playlist:create', 'playlist:mutate_songs'] }];

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes });

		expect(body).toMatchObject(insufficientPermissionsError());
	});
});

describe('add songs to playlist', () => {
	const makeAddSongsQuery = (shareID: string, playlistID: string, songIDs: string[]) => `
		addSongsToPlaylist(shareID: "${shareID}", playlistID: "${playlistID}", songIDs: [${songIDs.map(songID => `"${songID}"`).join(',')}]){
			${songKeys}
		}
	`;
	const shareID = testData.shares.library_user1.share_id.toString();

	test('existing songs', async () => {
		const { graphQLServer, playlistService } = await setupTest({});
		const { id: playlistID } = await playlistService.create(shareID, 'Some new playlist');
		const songs = [testData.songs.song1_library_user1, testData.songs.song2_library_user1, testData.songs.song3_library_user1];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.song_id.toString())));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = songs.map((song, idx) => Song.fromDBResult({
			...song,
			date_added: new Date(),
			date_removed: null,
		}, shareID));

		expect(expectedSongs).toBeArrayOfSize(songs.length);
		expectedSongs.forEach(expectedSong => includesSong(body.data.addSongsToPlaylist, expectedSong));
	});

	test('not existing songs', async () => {
		const { graphQLServer, playlistService } = await setupTest({});
		const { id: playlistID } = await playlistService.create(shareID, 'Some other new playlist');
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, [uuid()]));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.addSongsToPlaylist).toBeArrayOfSize(0);
	});

	test('duplicates', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const songs = [testData.songs.song1_library_user1, testData.songs.song2_library_user1, testData.songs.song3_library_user1];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.song_id.toString())));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = songs.map((song, idx) => Song.fromDBResult({
			...song,
			date_added: new Date(),
			date_removed: null,
		}, shareID));

		expect(body.data.addSongsToPlaylist).toBeArrayOfSize(songs.length * 2);
		expectedSongs.forEach(expectedSong => includesSong(body.data.addSongsToPlaylist, expectedSong));
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTest({ database: makeMockDatabase() });
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, []));
		const scopes: Scopes = [{ shareID, permissions: ['playlist:create', 'playlist:modify'] }];

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes });

		expect(body).toMatchObject(insufficientPermissionsError());
	});

	test('linked song from share should succeed for own playlist', async () => {
		const { graphQLServer, playlistService } = await setupTest({});
		const { id: playlistID } = await playlistService.create(shareID, 'Some new playlist');
		const songs = [testData.songs.song1_library_user1, testData.songs.song4_library_user2];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.song_id.toString())));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = songs.map((song, idx) => Song.fromDBResult({
			...song,
			date_added: new Date(),
			date_removed: null,
		}, idx === 0 ? shareID : testData.shares.library_user2.share_id));

		expect(expectedSongs).toBeArrayOfSize(songs.length);
		expectedSongs.forEach(expectedSong => includesSong(body.data.addSongsToPlaylist, expectedSong));
	})

	test('linked song from share should succeed for shared playlist', async () => {
		const shareID = testData.shares.some_shared_library.share_id
		const { graphQLServer, playlistService } = await setupTest({});
		const { id: playlistID } = await playlistService.create(shareID, 'Some new shared playlist');
		const songs = [testData.songs.song1_library_user1, testData.songs.song4_library_user2];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.song_id.toString())));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = songs.map((song, idx) => Song.fromDBResult({
			...song,
			date_added: new Date(),
			date_removed: null,
		}, idx === 0 ? testData.shares.library_user1.share_id : testData.shares.library_user2.share_id));

		expect(expectedSongs).toBeArrayOfSize(songs.length);
		expectedSongs.forEach(expectedSong => includesSong(body.data.addSongsToPlaylist, expectedSong));
	})

	test('foreign song from unrelated library should fail for own playlist', async () => {
		const { graphQLServer, playlistService } = await setupTest({});
		const { id: playlistID } = await playlistService.create(shareID, 'Some new playlist');
		const songs = [testData.songs.song1_library_user1, testData.songs.song5_library_user3];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.song_id.toString())));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `User has no permission to add those song ids to a playlist` }]
		));
	})

	test('foreign song from unrelated library should fail for shared playlist', async () => {
		const shareID = testData.shares.some_shared_library.share_id
		const { graphQLServer, playlistService } = await setupTest({});
		const { id: playlistID } = await playlistService.create(shareID, 'Some new shared playlist');
		const songs = [testData.songs.song1_library_user1, testData.songs.song5_library_user3];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.song_id.toString())));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `User has no permission to add those song ids to a playlist` }]
		));
	})
});

describe('remove songs from playlist', () => {
	const makeRemoveSongsQuery = (shareID: string, playlistID: string, songIDs: string[]) => `
		removeSongsFromPlaylist(shareID: "${shareID}", playlistID: "${playlistID}", songIDs: [${songIDs.map(songID => `"${songID}"`).join(',')}]){
			${songKeys}
		}
	`;

	const shareID = testData.shares.library_user1.share_id.toString();

	test('existing songs', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const songs = [testData.playlists.playlist1_library_user1.songs[1]];
		const query = makeMutation(makeRemoveSongsQuery(shareID, playlistID, songs.map(song => song.song_id.toString())));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = [testData.playlists.playlist1_library_user1.songs[0], testData.playlists.playlist1_library_user1.songs[2]]
			.map((song, idx) => ({
				id: song.song_id.toString()
			}));

		expect(body.data.removeSongsFromPlaylist).toBeArrayOfSize(2);
		expect(sortBy(body.data.removeSongsFromPlaylist, 'position')).toMatchObject(expectedSongs);
	});

	test('not existing songs', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const songIDs = [uuid(), uuid()];

		const query = makeMutation(makeRemoveSongsQuery(shareID, playlistID, songIDs));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		const expectedSongs = testData.playlists.playlist1_library_user1.songs.map((song, idx) => ({
			id: song.song_id.toString()
		}));

		expect(body.data.removeSongsFromPlaylist).toBeArrayOfSize(testData.playlists.playlist1_library_user1.songs.length);
		expect(sortBy(body.data.removeSongsFromPlaylist, 'position')).toMatchObject(expectedSongs);
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTest({ database: makeMockDatabase() });
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeMutation(makeRemoveSongsQuery(shareID, playlistID, []));
		const scopes: Scopes = [{ shareID, permissions: ['playlist:create', 'playlist:modify'] }];

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes });

		expect(body).toMatchObject(insufficientPermissionsError());
	});
});

describe('update order', () => {
	const makeUpdateOrderMutation = (shareID: string, playlistID: string, orderUpdates: OrderUpdate[]) => `
		updateOrderOfPlaylist(shareID: "${shareID}", playlistID:"${playlistID}", orderUpdates: [${orderUpdates.map(orderUpdate => `["${orderUpdate[0]}", ${orderUpdate[1]}]`).join(',')}]){
			${songKeys}
		}
	`;

	const shareID = testData.shares.library_user1.share_id;

	test('valid order', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id;
		const orderUpdates: OrderUpdate[] = [
			[testData.playlists.playlist1_library_user1.songs[0].song_id, 2],
			[testData.playlists.playlist1_library_user1.songs[1].song_id, 1],
			[testData.playlists.playlist1_library_user1.songs[2].song_id, 0],
		];

		const query = makeMutation(makeUpdateOrderMutation(shareID, playlistID, orderUpdates));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.updateOrderOfPlaylist).toMatchObject(orderUpdates.reverse().map(orderUpdate => ({
			id: orderUpdate[0],
		})));
	});

	test('not existing songs', async () => {
		const { graphQLServer } = await setupTest({});
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const songIDNotPart = uuid();
		const orderUpdates: OrderUpdate[] = [
			[songIDNotPart, 2],
			[testData.playlists.playlist1_library_user1.songs[1].song_id.toString(), 1],
			[testData.playlists.playlist1_library_user1.songs[2].song_id.toString(), 0],
		];

		const query = makeMutation(makeUpdateOrderMutation(shareID, playlistID, orderUpdates));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Some songs are not part of this playlist` }]
		));
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTest({ database: makeMockDatabase() });
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString();
		const query = makeMutation(makeUpdateOrderMutation(shareID, playlistID, []));
		const scopes: Scopes = [{ shareID, permissions: ['playlist:create', 'playlist:modify'] }];

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes });

		expect(body).toMatchObject(insufficientPermissionsError());
	});
})