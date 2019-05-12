import { PeristentTokenStore } from "../auth/TokenStore";
import { makeMockedDatabase } from "./mocks/mock-database";
import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env";
import { IDatabaseClient } from "cassandra-schema-builder";
import { clearTables } from "../database/schema/make-database-schema";

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

describe('persistent store', () => {
	const mockDatabase = makeMockedDatabase();

	test('add token', () => {
		const store = PeristentTokenStore({ database: mockDatabase, tokenGroup: 'group1' });
		const token = 'some_token';

		expect(store.hasToken(token)).toBeFalse();
		store.addToken(token);
		expect(store.hasToken(token)).toBeTrue();
	});

	test('persist', async () => {
		const { database } = await setupTest({});

		const store = PeristentTokenStore({ database, tokenGroup: 'group1' });
		const tokensFirstRun = ['token1', 'token2', 'token3'];
		const tokensSecondRun = ['token4', 'token5'];

		tokensFirstRun.forEach(token => store.addToken(token));

		await store.persist();

		tokensSecondRun.forEach(token => store.addToken(token));

		await store.persist();
		await store.load();

		const allTokens = tokensFirstRun.concat(tokensSecondRun);
		allTokens.forEach(token => expect(store.hasToken(token)));

		const newStore = PeristentTokenStore({ database, tokenGroup: 'group1' });
		await newStore.load();

		allTokens.forEach(token => expect(newStore.hasToken(token)));
	});

	test('no group collisions', async () => {
		const { database } = await setupTest({});

		const storeGroup1 = PeristentTokenStore({ database, tokenGroup: 'group1' });
		const storeGroup2 = PeristentTokenStore({ database, tokenGroup: 'group2' });
		const tokensGroup1 = ['g1_token1', 'g1_token2'];
		const tokensGroup2 = ['g2_token1', 'g2_token2'];

		tokensGroup1.forEach(token => storeGroup1.addToken(token));
		tokensGroup2.forEach(token => storeGroup2.addToken(token));

		await storeGroup1.persist();
		await storeGroup2.persist();

		await storeGroup1.load();
		await storeGroup2.load();

		tokensGroup1.forEach(token => expect(storeGroup1.hasToken(token)));
		tokensGroup2.forEach(token => expect(storeGroup2.hasToken(token)));
	});
});