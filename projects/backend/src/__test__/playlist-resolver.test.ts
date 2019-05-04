import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery, argumentValidationError, makeGraphQLResponse } from "./utils/graphql";
import moment = require("moment");
import { TimeUUID } from "../types/TimeUUID";
import { playlistSongKeys } from "./fixtures/song-query";
import { playlistSongFromDBResult } from "../models/SongModel";
import { includesSong } from "./utils/compare-songs";
import { OrderUpdate } from "../services/PlaylistService";
import { sortBy } from 'lodash';

const setupTest = async () => {
	const { graphQLServer, cleanUp, ...testEnv } = await setupTestEnv({});
	cleanupHooks.push(cleanUp);

	return { graphQLServer, ...testEnv };
}

const makeMutation = (mutation: string) => `mutation{${mutation}}`;

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

describe('create playlist', () => {
	const makeCreatePlaylistMutation = (shareID: string, name: string) => `
		createPlaylist(shareID: "${shareID}", name: "${name}"){id, name, shareID, dateAdded}
	`;

	test('valid playlist name', async () => {
		const { graphQLServer } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const name = 'A new playlist';
		const dateBeforeInsert = moment();
		const query = makeMutation(makeCreatePlaylistMutation(shareID, name));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const mutationResult = body.data.createPlaylist;
		expect(mutationResult).toMatchObject({ name, shareID });
		expect(moment(mutationResult.dateAdded).isAfter(dateBeforeInsert)).toBeTrue();
		expect(mutationResult.id).toBeTimeUUID();
	});

	test('invalid playlist name', async () => {
		const { graphQLServer } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const query = makeMutation(makeCreatePlaylistMutation(shareID, 'S'));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(argumentValidationError());
	});

	test('playlist already existing name', async () => {
		const { graphQLServer } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const name = testData.playlists.playlist1_library_user1.name;
		const dateBeforeInsert = moment();
		const query = makeMutation(makeCreatePlaylistMutation(shareID, name));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const mutationResult = body.data.createPlaylist;
		expect(mutationResult).toMatchObject({ name, shareID });
		expect(moment(mutationResult.dateAdded).isAfter(dateBeforeInsert)).toBeTrue();
		expect(mutationResult.id).toBeTimeUUID();
	});
});

describe('delete playlist', () => {
	const makeDeletePlaylistMutation = (shareID: string, playlistID: string) => `
		deletePlaylist(shareID: "${shareID}", playlistID: "${playlistID}")
	`;

	test('existing playlist', async () => {
		const { graphQLServer } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const query = makeMutation(makeDeletePlaylistMutation(shareID, playlistID));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toEqual(makeGraphQLResponse({ deletePlaylist: true }));
	});

	test('not existing playlist', async () => {
		const { graphQLServer } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const playlistID = TimeUUID().toString();
		const query = makeMutation(makeDeletePlaylistMutation(shareID, playlistID));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toEqual(makeGraphQLResponse({ deletePlaylist: true }));
	});
});

describe('rename playlist', () => {
	const makeRenamePlaylistQuery = (shareID: string, playlistID: string, newName: string) => `
		renamePlaylist(shareID: "${shareID}", playlistID: "${playlistID}", newName: "${newName}")
	`;

	test('existing playlist', async () => {
		const { graphQLServer, playlistService } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const newName = 'Some new playlist name';
		const query = makeMutation(makeRenamePlaylistQuery(shareID, playlistID, newName));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toEqual(makeGraphQLResponse({ renamePlaylist: true }));

		const playlist = await playlistService.getByID(shareID, playlistID);
		expect(playlist).toMatchObject({ id: playlistID, name: newName });
	});

	test('not existing playlist', async () => {
		const { graphQLServer, playlistService } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const playlistID = TimeUUID().toString();
		const newName = 'Some new playlist name';
		const query = makeMutation(makeRenamePlaylistQuery(shareID, playlistID, newName));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toEqual(makeGraphQLResponse({ renamePlaylist: true }));

		const playlists = await playlistService.getPlaylistsForShare(shareID);
		expect(playlists).toBeArrayOfSize(2);
	});

	test('invalid new name', async () => {
		const { graphQLServer } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const query = makeMutation(makeRenamePlaylistQuery(shareID, playlistID, 'S'));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(argumentValidationError());
	});
});

describe('add songs to playlist', () => {
	const makeAddSongsQuery = (shareID: string, playlistID: string, songIDs: string[]) => `
		addSongsToPlaylist(shareID: "${shareID}", playlistID: "${playlistID}", songIDs: [${songIDs.map(songID => `"${songID}"`).join(',')}]){
			${playlistSongKeys}
		}
	`;

	test('existing songs', async () => {
		const { graphQLServer, playlistService } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const { id: playlistID } = await playlistService.create(shareID, 'Some new playlist');
		const songs = [testData.songs.song1_library_user1, testData.songs.song2_library_user1, testData.songs.song3_library_user1];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.id.toString())));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const expectedSongs = songs.map((song, idx) => playlistSongFromDBResult({
			...song,
			position: idx,
			playlist_id: TimeUUID(playlistID),
			date_added: new Date(),
			date_removed: null,
		}));

		expect(expectedSongs).toBeArrayOfSize(songs.length);
		expectedSongs.forEach(expectedSong => includesSong(body.data.addSongsToPlaylist, expectedSong));
	});

	test('not existing songs', async () => {
		const { graphQLServer, playlistService } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const { id: playlistID } = await playlistService.create(shareID, 'Some other new playlist');
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, [TimeUUID().toString()]));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body.data.addSongsToPlaylist).toBeArrayOfSize(0);
	});

	test('duplicates', async () => {
		const { graphQLServer } = await setupTest();
		const shareID = testData.shares.library_user1.id.toString();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const songs = [testData.songs.song1_library_user1, testData.songs.song2_library_user1, testData.songs.song3_library_user1];
		const query = makeMutation(makeAddSongsQuery(shareID, playlistID, songs.map(song => song.id.toString())));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const expectedSongs = songs.map((song, idx) => playlistSongFromDBResult({
			...song,
			position: idx,
			playlist_id: TimeUUID(playlistID),
			date_added: new Date(),
			date_removed: null,
		}));

		expect(body.data.addSongsToPlaylist).toBeArrayOfSize(songs.length);
		expectedSongs.forEach(expectedSong => includesSong(body.data.addSongsToPlaylist, expectedSong));
	});
});

describe('remove songs from playlist', () => {
	const makeRemoveSongsQuery = (playlistID: string, songIDs: string[]) => `
		removeSongsFromPlaylist(playlistID: "${playlistID}", songIDs: [${songIDs.map(songID => `"${songID}"`).join(',')}]){
			${playlistSongKeys}
		}
	`;

	test('existing songs', async () => {
		const { graphQLServer } = await setupTest();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const songs = [testData.playlists.playlist1_library_user1.songs[1]];
		const query = makeMutation(makeRemoveSongsQuery(playlistID, songs.map(song => song.id.toString())));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const expectedSongs = [testData.playlists.playlist1_library_user1.songs[0], testData.playlists.playlist1_library_user1.songs[2]]
			.map((song, idx) => ({
				id: song.id.toString(),
				position: idx
			}));

		expect(body.data.removeSongsFromPlaylist).toBeArrayOfSize(2);
		expect(sortBy(body.data.removeSongsFromPlaylist, 'position')).toMatchObject(expectedSongs);
	});

	test('not existing songs', async () => {
		const { graphQLServer } = await setupTest();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const songIDs = [TimeUUID().toString(), TimeUUID().toString()];

		const query = makeMutation(makeRemoveSongsQuery(playlistID, songIDs));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const expectedSongs = testData.playlists.playlist1_library_user1.songs.map((song, idx) => ({
			id: song.id.toString(),
			position: idx
		}));

		expect(body.data.removeSongsFromPlaylist).toBeArrayOfSize(testData.playlists.playlist1_library_user1.songs.length);
		expect(sortBy(body.data.removeSongsFromPlaylist, 'position')).toMatchObject(expectedSongs);
	});
});

describe('update order', () => {
	const makeUpdateOrderMutation = (playlistID: string, orderUpdates: OrderUpdate[]) => `
		updateOrderOfPlaylist(playlistID:"${playlistID}", orderUpdates: [${orderUpdates.map(orderUpdate => `["${orderUpdate[0]}", ${orderUpdate[1]}]`).join(',')}]){
			${playlistSongKeys}
		}
	`;

	test('valid order', async () => {
		const { graphQLServer } = await setupTest();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const orderUpdates: OrderUpdate[] = [
			[testData.playlists.playlist1_library_user1.songs[0].id.toString(), 2],
			[testData.playlists.playlist1_library_user1.songs[1].id.toString(), 1],
			[testData.playlists.playlist1_library_user1.songs[2].id.toString(), 0],
		];

		const query = makeMutation(makeUpdateOrderMutation(playlistID, orderUpdates));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body.data.updateOrderOfPlaylist).toMatchObject(sortBy(orderUpdates.map(orderUpdate => ({
			id: orderUpdate[0],
			position: orderUpdate[1],
		})), 'position'));
	});

	test('not existing songs', async () => {
		const { graphQLServer } = await setupTest();
		const playlistID = testData.playlists.playlist1_library_user1.id.toString();
		const songIDNotPart = TimeUUID().toString();
		const orderUpdates: OrderUpdate[] = [
			[songIDNotPart, 2],
			[testData.playlists.playlist1_library_user1.songs[1].id.toString(), 1],
			[testData.playlists.playlist1_library_user1.songs[2].id.toString(), 0],
		];

		const query = makeMutation(makeUpdateOrderMutation(playlistID, orderUpdates));

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Some songs are not part of this playlist` }]
		));
	});
})