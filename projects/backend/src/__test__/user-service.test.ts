import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { User } from "../models/UserModel";
import { UserNotFoundError } from "../services/UserService";
import { IDatabaseClient } from "postgres-schema-builder";
import { clearTables } from "../database/database";

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

describe('get user by email', () => {
	test('found', async () => {
		const { userService } = await setupTest({});

		const user = await userService.getUserByEMail(testData.users.user1.email);

		expect(user).toEqual(User.fromDBResult(testData.users.user1));
	});

	test('not found', async () => {
		const { userService } = await setupTest({});

		await expect(userService.getUserByEMail('some@mail.com')).rejects.toThrowError(UserNotFoundError);
	});
});