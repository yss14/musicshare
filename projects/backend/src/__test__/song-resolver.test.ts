import { SongInput } from "../inputs/SongInput";
import { songKeys } from "./fixtures/song-query";
import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { executeGraphQLQuery } from "./utils/graphql";

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
	test('valid input', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const share = testData.shares.library_user1;
		const song = testData.songs.song1_library_user1;
		const input: any = <SongInput>{
			bpm: 140,
			isRip: false,
			title: 'Some new title',
			label: null,
			artists: ['Some new artist'],
		}
		const query = makeUpdateSongMutation(share.id.toString(), song.id.toString(), input);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		const updatedSong = body.data.updateSong;

		expect(updatedSong).toMatchObject(input);
	});
});