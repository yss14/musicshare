// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import Container from "typedi";
import { makeGraphQLServer } from "../../server/GraphQLServer";
import { ShareResolver } from "../../resolvers/ShareResolver";
import { SongResolver } from "../../resolvers/SongResolver";
import { UserResolver } from "../../resolvers/UserResolver";
import { makeTestDatabase, IDatabaseClient } from "cassandra-schema-builder";
import { makeDatabaseSeed, testData } from "../../database/seed";
import { makeDatabaseSchema } from "../../database/schema/make-database-schema";
import uuid = require("uuid");
import { PlaylistResolver } from "../../resolvers/PlaylistResolver";
import { makeGraphQLContextProvider, Scopes } from "../../types/context";
import { Permissions } from "../../auth/permissions";
import { isMockedDatabase } from "../mocks/mock-database";
import { configFromEnv } from "../../types/config";
import { initServices } from "../../services/services";

export interface SetupTestEnvArgs {
	database: IDatabaseClient;
	seedDatabase?: boolean;
}

// tslint:disable:no-parameter-reassignment
export const setupTestEnv = async ({ seedDatabase, database }: SetupTestEnvArgs) => {
	seedDatabase = seedDatabase === undefined ? true : seedDatabase;

	const config = configFromEnv();

	if (isMockedDatabase(database)) {
		seedDatabase = false;
	}

	const testID = uuid();

	const services = initServices(config, database);

	const shareResolver = new ShareResolver(services);
	const songResolver = new SongResolver(services);
	const userResolver = new UserResolver(services);
	const playlistResolver = new PlaylistResolver(services);

	Container.of(testID).set(ShareResolver, shareResolver);
	Container.of(testID).set(SongResolver, songResolver);
	Container.of(testID).set(UserResolver, userResolver);
	Container.of(testID).set(PlaylistResolver, playlistResolver);

	const seed = makeDatabaseSeed({ database, services });

	if (seedDatabase) {
		await seed();
	}

	const authChecker = () => true;

	const graphQLServer = await makeGraphQLServer(
		Container.of(testID),
		makeGraphQLContextProvider(services),
		config,
		authChecker,
		UserResolver, ShareResolver, SongResolver
	);

	const allScopes = makeAllScopes();

	return {
		graphQLServer,
		database,
		allScopes,
		...services,
		services,
	};
}

export const setupTestSuite = () => {
	let database: IDatabaseClient | null = null;
	let databaseCleanUp: () => Promise<void> = () => Promise.resolve();

	const getDatabase = async () => {
		if (!database) {
			const testDatabaseEnv = await makeTestDatabase();

			database = testDatabaseEnv.database;
			databaseCleanUp = testDatabaseEnv.cleanUp;

			await makeDatabaseSchema(database, { keySpace: testDatabaseEnv.databaseKeyspace });
		}

		return database;
	}

	const cleanUp = async () => {
		return databaseCleanUp();
	}

	return { getDatabase, cleanUp };
}

export const makeAllScopes = (): Scopes => [
	{ shareID: testData.shares.library_user1.id.toString(), permissions: Permissions.ALL },
	{ shareID: testData.shares.some_shared_library.id.toString(), permissions: Permissions.ALL },
];