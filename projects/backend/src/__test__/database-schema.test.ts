import { makeTestDatabase, IDatabaseClient } from 'postgres-schema-builder';
import { clearDatabase, makeDatabaseSchema, clearTables } from "../database/schema/make-database-schema";
import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from './utils/setup-test-env';
import { configFromEnv, IConfig } from '../types/config';
import { insertProductionSetupSeed } from '../database/seed';
import { Share } from '../models/ShareModel';

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

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await cleanUp();
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('clear keyspace', async () => {
	const { database, clientConfig, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await makeDatabaseSchema(database, { databaseUser: clientConfig.user! });
	await clearDatabase(database, clientConfig.user!);
});

test('insertProductionSetupSeed', async () => {
	const { services, userService, passwordLoginService, shareService } = await setupTest({ seedDatabase: false });

	const config: IConfig = {
		...configFromEnv(),
		setup: {
			seed: {
				name: 'Some Testuser',
				password: 'password1234',
				email: 'donotreply@musicshare.rocks',
				shareName: 'Some Share',
				dbCleanInit: false,
				dbSeed: false,
			}
		}
	}
	const { name, email, password } = config.setup.seed;

	await insertProductionSetupSeed({ config, services });

	const user = await userService.getUserByEMail(config.setup.seed.email);
	expect(user).toMatchObject({ name, email });

	const refreshToken = await passwordLoginService.login(email, password);
	expect(refreshToken).toBeString();

	const share = await shareService.getSharesOfUser(user.id);
	expect(share).toMatchObject([<Partial<Share>>{
		isLibrary: true,
		name: config.setup.seed.shareName,
	}]);
});