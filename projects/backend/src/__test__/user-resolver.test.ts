// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql";
import { testData, testPassword } from "../database/seed";
import { Share } from "../models/ShareModel";
import { setupTestEnv } from "./utils/setup-test-env";
import { TimeUUID } from "../types/TimeUUID";
import * as argon2 from 'argon2';

const makeUserQuery = (id: string, withShares: boolean = false, libOnly: boolean = true) => {
	return `
		query{
			user(id: "${id}"){
				id,
				name,
				email,
				${withShares ? `shares(libOnly: ${libOnly}){
					id,
					name,
					userID,
					isLibrary
				}` : ''}
			}
		}
	`;
}

const makeLoginMutation = (email: string, password: string) => `
	mutation{
		login(email: "${email}", password: "${password}")
	}
`;

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

describe('get user by id', () => {
	test('get user by id', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const { users } = testData;
		const query = makeUserQuery(users.user1.id.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		expect(body).toEqual(makeGraphQLResponse({ user: users.user1 }));
	});

	test('get user by id not existing', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const userID = TimeUUID('a0d8e1f0-aeb1-11e8-a117-43673ffd376a');
		const query = makeUserQuery(userID.toString());

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ user: null },
			[{ message: `User with id ${userID} not found` }]
		));
	});
});

describe('get users shares', () => {
	test('get users shares only lib', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeUserQuery(testUser.id.toString(), true, true);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toEqual(makeGraphQLResponse({
			user: {
				...testUser,
				shares: [testData.shares.library_user1].map(Share.fromDBResult)
			}
		}));
	});

	test('get users shares all', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeUserQuery(testUser.id.toString(), true, false);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toEqual(makeGraphQLResponse({
			user: {
				...testUser,
				shares: [testData.shares.some_shared_library, testData.shares.library_user1].map(Share.fromDBResult)
			}
		}));
	});
});

describe('login', () => {
	test('successful', async () => {
		const { graphQLServer, cleanUp, authService } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, testPassword);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.login).toBeString();
		await expect(authService.verifyToken(body.data.login)).resolves.toBeObject();
	});

	test('wrong password', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, testPassword + 'wrong');

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Login credentials invalid` }]
		));
	});

	test('already hashed password', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, await argon2.hash(testPassword));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Login credentials invalid` }]
		));
	});

	test('not existing email', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email + 'a', testPassword);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Login credentials invalid` }]
		));
	});

	test('unexpected internal error', async () => {
		const { graphQLServer, cleanUp, database } = await setupTestEnv({});
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, testPassword);

		await database.close(); // force unexpected error

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.errors[0].message.indexOf('An internal server error occured')).toBeGreaterThan(-1);
	});
});