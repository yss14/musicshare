// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { executeGraphQLQuery, makeGraphQLResponse, insufficientPermissionsError } from "./utils/graphql";
import { testData, testPassword } from "../database/seed";
import { Share } from "../models/ShareModel";
import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env";
import { TimeUUID } from "../types/TimeUUID";
import * as argon2 from 'argon2';
import { makeMockedDatabase } from "./mocks/mock-database";
import { User } from "../models/UserModel";
import { plainToClass } from "class-transformer";
import { Permission } from "../auth/permissions";
import { Scopes } from "../types/context";
import { IDatabaseClient } from "postgres-schema-builder";
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

const makeUserQuery = (withShares: boolean = false, libOnly: boolean = true) => {
	return `
		query{
			user{
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
		login(email: "${email}", password: "${password}"){
			authToken,
			refreshToken
		}
	}
`;

describe('get user by id', () => {
	test('get user by id', async () => {
		const { graphQLServer } = await setupTest({});

		const { users } = testData;
		const query = makeUserQuery();

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID: users.user1.user_id.toString() });
		expect(body).toEqual(makeGraphQLResponse({ user: User.fromDBResult(users.user1) }));
	});

	test('get user by id not existing', async () => {
		const { graphQLServer } = await setupTest({});

		const userID = TimeUUID('a0d8e1f0-aeb1-11e8-a117-43673ffd376a').toString();
		const query = makeUserQuery();

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID });

		expect(body).toMatchObject(makeGraphQLResponse(
			{ user: null },
			[{ message: `User with id ${userID} not found` }]
		));
	});
});

describe('get users shares', () => {
	test('get users shares only lib', async () => {
		const { graphQLServer } = await setupTest({});

		const testUser = testData.users.user1;
		const query = makeUserQuery(true, true);

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID: testUser.user_id.toString() });

		expect(body).toEqual(makeGraphQLResponse({
			user: {
				...User.fromDBResult(testUser),
				shares: [testData.shares.library_user1].map(Share.fromDBResult)
			}
		}));
	});

	test('get users shares all', async () => {
		const { graphQLServer } = await setupTest({});

		const testUser = testData.users.user1;
		const query = makeUserQuery(true, false);

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID: testUser.user_id.toString() });

		expect(body).toEqual(makeGraphQLResponse({
			user: {
				...User.fromDBResult(testUser),
				shares: [testData.shares.some_shared_library, testData.shares.library_user1].map(Share.fromDBResult)
			}
		}));
	});
});

describe('login', () => {
	test('successful', async () => {
		const { graphQLServer, authService } = await setupTest({});

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, testPassword);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		const { authToken, refreshToken } = body.data.login;

		expect(authToken).toBeString();
		expect(refreshToken).toBeString();
		await expect(authService.verifyToken(authToken)).resolves.toBeObject();
		await expect(authService.verifyToken(refreshToken)).resolves.toBeObject();
	});

	test('wrong password', async () => {
		const { graphQLServer } = await setupTest({});

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, testPassword + 'wrong');

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Login credentials invalid` }]
		));
	});

	test('already hashed password', async () => {
		const { graphQLServer } = await setupTest({});

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, await argon2.hash(testPassword));

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Login credentials invalid` }]
		));
	});

	test('not existing email', async () => {
		const { graphQLServer } = await setupTest({});

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email + 'a', testPassword);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Login credentials invalid` }]
		));
	});

	test('unexpected internal error', async () => {
		const database = makeMockedDatabase();
		database.query = () => { throw new Error('Unexpected error'); }
		const { graphQLServer } = await setupTest({ database });

		const testUser = testData.users.user1;
		const query = makeLoginMutation(testUser.email, testPassword);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.errors[0].message.indexOf('An internal server error occured')).toBeGreaterThan(-1);
	});
});

describe('issue new auth token', () => {
	const makeIssueAuthTokenQuery = (refreshToken: string) => `mutation{issueAuthToken(refreshToken: "${refreshToken}")}`;
	const mockDatabase = makeMockedDatabase();
	(<jest.Mock>mockDatabase.query).mockReturnValue([]);
	const testUser = User.fromDBResult(testData.users.user1);

	test('valid refresh token', async () => {
		const { graphQLServer, authService } = await setupTest({});

		const refreshToken = await authService.issueRefreshToken(testUser);
		const query = makeIssueAuthTokenQuery(refreshToken);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });
		const authToken = body.data.issueAuthToken;

		expect(authToken).toBeString();
		await expect(authService.verifyToken(authToken)).resolves.toBeObject();
	});

	test('invalid refresh token', async () => {
		const { graphQLServer } = await setupTest({ database: mockDatabase });
		const refreshToken = 'abcd';
		const query = makeIssueAuthTokenQuery(refreshToken);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: 'Invalid AuthToken' }]));
	});

	test('expired refresh token', async () => {
		const { graphQLServer, authService } = await setupTest({ database: mockDatabase });
		const refreshToken = await authService.issueRefreshToken(testUser, '-1 day');
		const query = makeIssueAuthTokenQuery(refreshToken);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: 'Invalid AuthToken' }]));
	});

	test('user not found', async () => {
		const { graphQLServer, authService } = await setupTest({ database: mockDatabase });
		const testUser = plainToClass(User, { id: TimeUUID().toString() });
		const refreshToken = await authService.issueRefreshToken(testUser);
		const query = makeIssueAuthTokenQuery(refreshToken);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `User with id ${testUser.id} not found` }]));
	});

	test('unexpected internal error', async () => {
		const database = makeMockedDatabase();
		database.query = () => { throw new Error('Unexpected error'); }
		const { graphQLServer, authService } = await setupTest({ database: database });

		const refreshToken = await authService.issueRefreshToken(testUser);
		const query = makeIssueAuthTokenQuery(refreshToken);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.errors[0].message.indexOf('An internal server error occured')).toBeGreaterThan(-1);
	});
});

describe('update user permissions', () => {
	const makeUpdateUserPermissionsMutation = (shareID: string, userID: string, permissions: Permission[]) => `
		mutation{updateUserPermissions(shareID: "${shareID}", userID: "${userID}", permissions: [${permissions.map(permission => `"${permission}"`).join(',')}])}
	`;
	const shareID = testData.shares.library_user1.share_id.toString();
	const userID = testData.users.user1.user_id.toString();

	const database = makeMockedDatabase();
	(<jest.Mock>database.query).mockReturnValue([testData.shares.library_user1]);

	test('valid permission list', async () => {
		const { graphQLServer } = await setupTest({});

		const permissions: Permission[] = ['playlist:create', 'share:members'];
		const query = makeUpdateUserPermissionsMutation(shareID, userID, permissions);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body.data.updateUserPermissions.sort()).toEqual(permissions);
	});

	test('invalid permission list', async () => {
		const { graphQLServer } = await setupTest({ database: database });
		const permissions: any[] = ['playlist:createe', 'share:members'];

		const query = makeUpdateUserPermissionsMutation(shareID, userID, permissions);

		const { body } = await executeGraphQLQuery({ graphQLServer, query });

		expect(body).toMatchObject(makeGraphQLResponse(
			null,
			[{ message: `Argument Validation Error` }]
		));
	});

	test('insufficient permissions', async () => {
		const { graphQLServer } = await setupTest({ database: database });
		const permissions: Permission[] = ['playlist:create', 'share:members'];
		const query = makeUpdateUserPermissionsMutation(shareID, userID, permissions);
		const scopes: Scopes = [{ shareID, permissions: ['playlist:create', 'playlist:modify'] }];

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes });

		expect(body).toMatchObject(insufficientPermissionsError());
	});
});