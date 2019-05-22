import { makeTestDatabase, IDatabaseClient } from 'cassandra-schema-builder';
import { clearKeySpace, makeDatabaseSchema, clearTables } from "../database/schema/make-database-schema";
import { Tables } from '../database/schema/system-tables';
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
	const { database, databaseKeyspace, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	await makeDatabaseSchema(database, { keySpace: databaseKeyspace });
	await clearKeySpace(database, databaseKeyspace);

	const currentTables = await database.query(Tables.select('*', ['keyspace_name'])([databaseKeyspace]));

	expect(currentTables).toEqual([]);
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
				shareName: 'Some Share'
			}
		}
	}
	const { name, email, password } = config.setup.seed;

	await insertProductionSetupSeed({ config, services });

	const user = await userService.getUserByEMail(config.setup.seed.email);
	expect(user).toMatchObject({ name, email });

	const refreshToken = await passwordLoginService.login(email, password);
	expect(refreshToken).toBeString();

	const share = await shareService.getSharesByUser(user.id);
	expect(share).toMatchObject([<Share>{
		isLibrary: true,
		name: config.setup.seed.shareName,
		userID: user.id,
	}]);
});