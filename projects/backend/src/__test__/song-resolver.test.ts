import { SongUpdateInput } from "../inputs/SongInput";
import { songKeys } from "./fixtures/song-query";
import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql";
import { HTTPStatusCodes } from "../types/http-status-codes";
import { makeMockedDatabase } from "./mocks/mock-database";

const inputToString = (input: SongUpdateInput): string => {
	return '{' + Object.entries(input).map(entry => `${entry[0]}:${JSON.stringify(entry[1])}`).join(',') + '}';
}

const makeUpdateSongMutation = (shareID: string, songID: string, input: SongUpdateInput) => `
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

	const mockDatabase = makeMockedDatabase();
	(<jest.Mock>mockDatabase.query).mockReturnValue([song]);

	test.only('valid input', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const input: any = <SongUpdateInput>{
			bpm: 140,
			isRip: false,
			title: 'Some new title',
			label: null,
			artists: ['Some new artist'],
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);
		const timestampBeforeUpdate = Date.now();

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		console.log(body)

		const { updateSong } = body.data;

		expect(updateSong).toMatchObject(input);
		expect(updateSong.dateLastEdit).toBeGreaterThan(timestampBeforeUpdate);
	});

	test('title null', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			title: null as any,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `SongInput attribute title cannot be set null explicitly` }]
		));
	});

	test('title empty', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			title: '',
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});

	test('invalid year', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			year: 195,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});

	test('empty artist item', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			artists: ['some valid', ''],
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});

	test('null artist', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			artists: null as any,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `SongInput attribute artists cannot be set null explicitly` }]
		));
	});

	test('null artist item', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			artists: ['some valid', null],
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		await executeGraphQLQuery({ graphQLServer, query, expectedHTTPCode: HTTPStatusCodes.BAD_REQUEST });
	});

	test('null type', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			type: null as any,
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `SongInput attribute type cannot be set null explicitly` }]
		));
	});

	test('empty type', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });

		const input: any = <SongUpdateInput>{
			type: '',
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `Argument Validation Error` }]
		));
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTestEnv({ mockDatabase });
		const input: any = <SongUpdateInput>{
			type: '',
		}
		const shareID = share.id.toString();
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes: [{ shareID, permissions: ['playlist:create', 'song:upload'] }] });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ updateSong: null },
			[{ message: `User has insufficient permissions to perform this action!` }]
		));
	});
});