import { setupTestEnv } from "./utils/setup-test-env";
import { testData } from "../database/seed";
import { User } from "../models/UserModel";
import { UserNotFoundError } from "../services/UserService";

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

const setupLocalTestEnv = async () => {
	const { cleanUp, ...testEnv } = await setupTestEnv({});
	cleanupHooks.push(cleanUp);

	return testEnv;
}

describe('get user by email', () => {
	test('found', async () => {
		const { userService } = await setupLocalTestEnv();

		const user = await userService.getUserByEMail(testData.users.user1.email);

		expect(user).toEqual(User.fromDBResult(testData.users.user1));
	});

	test('not found', async () => {
		const { userService } = await setupLocalTestEnv();

		await expect(userService.getUserByEMail('some@mail.com')).rejects.toThrowError(UserNotFoundError);
	});
});