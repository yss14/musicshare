import { SongInput } from "../inputs/SongInput";
import { songKeys } from "./fixtures/song-query";
import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql";
import { HTTPStatusCodes } from "../types/http-status-codes";

const inputToString = (input: SongInput): string => {
	return '{' + Object.entries(input).map(entry => `${entry[0]}:${JSON.stringify(entry[1])}`).join(',') + '}';
}

const makeUpdateSongMutation = (shareID: string, songID: string, input: SongInput) => `
	mutation{
		updateSong(shareID: "${shareID}", songID: "${songID}", song: ${inputToString(input)}){
			${songKeys}
		}
	}
`;

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

describe('update song mutation', () => {
	const share = testData.shares.library_user1;
	const song = testData.songs.song1_library_user1;

	test('valid input', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const input: any = <SongInput>{
			bpm: 140,
			isRip: false,
			title: 'Some new title',
			label: null,
			artists: ['Some new artist'],
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const { updateSong } = body.data;

		expect(updateSong).toMatchObject(input);
	});

	test('title null', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			title: null as any,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `SongInput attribute title cannot be set null explicitly` }]
		));
	});

	test('title empty', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			title: '',
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});

	test('invalid year', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			year: 195,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});

	test('empty artist item', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			artists: ['some valid', ''],
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});

	test('null artist', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			artists: null as any,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `SongInput attribute artists cannot be set null explicitly` }]
		));
	});

	test('null artist item', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			artists: ['some valid', null],
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		await executeGraphQLQuery(graphQLServer, query, HTTPStatusCodes.BAD_REQUEST);
	});

	test('null type', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			type: null as any,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `SongInput attribute type cannot be set null explicitly` }]
		));
	});

	test('empty type', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase: true });

		const input: any = <SongInput>{
			type: '',
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});
});