// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { makeGraphQLServer } from "../server/GraphQLServer";
import { UserResolver } from "../resolvers/UserResolver";
import { useContainer } from "type-graphql";
import Container from "typedi";
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql";
import { makeTestDatabase } from "./utils/make-test-database";
import { UserService } from "../services/UserService";
import { ShareService } from "../services/ShareService";
import { SongService } from "../services/SongService";
import { testData } from "../database/seed";
import { types as CTypes } from 'cassandra-driver';
import { Share } from "../models/share.model";

const setupTestEnv = async () => {
	const { database, cleanUp, seed } = await makeTestDatabase();

	const songService = new SongService(database);
	const userService = new UserService(database);
	const shareService = new ShareService(database);
	useContainer(Container);
	Container.set('USER_SERVICE', userService);
	Container.set('SHARE_SERVICE', shareService);

	await seed(songService);

	const graphQLServer = await makeGraphQLServer(UserResolver);
	await graphQLServer.createHttpServer({});

	return { graphQLServer, database, cleanUp };
}

const makeUserQuery = (id: string, withShares: boolean = false, libOnly: boolean = true) => {
	return `
		query{
			user(id: "${id}"){
				id,
				name,
				emails,
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

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

describe('get user by id', () => {
	test('get user by id', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const { users } = testData;
		const query = makeUserQuery(users.user1.id.toString());

		const { body } = await executeGraphQLQuery(graphQLServer, query);
		expect(body).toEqual(makeGraphQLResponse({ user: users.user1 }));
	});

	test('get user by id not existing', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const userID = CTypes.TimeUuid.fromString('a0d8e1f0-aeb1-11e8-a117-43673ffd376a');
		const query = makeUserQuery(userID.toString());

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toMatchObject(makeGraphQLResponse(
			{ user: null },
			[{ message: `User with id ${userID} not found` }])
		);
	});
});

describe('get users shares', () => {
	test('get users shares only lib', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeUserQuery(testUser.id.toString(), true, true);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toEqual(makeGraphQLResponse({
			user: {
				...testUser,
				shares: [testData.shares.library_user1].map(Share.fromDBResult)
			}
		}));
	});

	test('get users shares all', async () => {
		const { graphQLServer, cleanUp } = await setupTestEnv();
		cleanupHooks.push(cleanUp);

		const testUser = testData.users.user1;
		const query = makeUserQuery(testUser.id.toString(), true, false);

		const { body } = await executeGraphQLQuery(graphQLServer, query);

		expect(body).toEqual(makeGraphQLResponse({
			user: {
				...testUser,
				shares: [testData.shares.some_shared_library, testData.shares.library_user1].map(Share.fromDBResult)
			}
		}));
	});
});