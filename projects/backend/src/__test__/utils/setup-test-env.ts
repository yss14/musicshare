// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import Container from "typedi";
import { makeGraphQLServer } from "../../server/GraphQLServer";
import { ShareResolver } from "../../resolvers/ShareResolver";
import { SongResolver } from "../../resolvers/SongResolver";
import { UserResolver } from "../../resolvers/UserResolver";
import { makeTestDatabase, IDatabaseClient, DatabaseSchema, composeCreateTableStatements } from "postgres-schema-builder";
import { seedDatabase, testData } from "../../database/seed";
import uuid = require("uuid");
import { PlaylistResolver } from "../../resolvers/PlaylistResolver";
import { makeGraphQLContextProvider, Scopes } from "../../types/context";
import { Permissions } from '@musicshare/shared-types';
import { isMockedDatabase } from "../mocks/mock-database";
import { configFromEnv } from "../../types/config";
import { initServices } from "../../services/services";
import { FileUploadResolver } from "../../resolvers/FileUploadResolver";
import { migrations } from '../../database/migrations'
import { Tables } from "../../database/tables";

export interface SetupTestEnvArgs {
	database: IDatabaseClient;
	seed?: boolean;
}

// tslint:disable:no-parameter-reassignment
export const setupTestEnv = async ({ seed, database }: SetupTestEnvArgs) => {
	let shouldSeedDatabase = seed === undefined ? true : seed;

	const config = configFromEnv();

	if (isMockedDatabase(database)) {
		shouldSeedDatabase = false;
	}

	const testID = uuid();

	const services = initServices(config, database);

	const shareResolver = new ShareResolver(services);
	const songResolver = new SongResolver(services);
	const userResolver = new UserResolver(services);
	const playlistResolver = new PlaylistResolver(services);
	const fileUploadResolver = new FileUploadResolver(services);

	Container.of(testID).set(ShareResolver, shareResolver);
	Container.of(testID).set(SongResolver, songResolver);
	Container.of(testID).set(UserResolver, userResolver);
	Container.of(testID).set(PlaylistResolver, playlistResolver);
	Container.of(testID).set(FileUploadResolver, fileUploadResolver);

	if (shouldSeedDatabase) {
		await seedDatabase({ database, services });
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

export const initDatabaseSchema = async (database: IDatabaseClient) => {
	const schema = DatabaseSchema({
		client: database,
		name: 'MusicShare',
		createStatements: composeCreateTableStatements(Tables),
		migrations,
	})

	await schema.init()
	await schema.migrateLatest()
}

export const setupTestSuite = () => {
	let database: IDatabaseClient | null = null;
	let databaseCleanUp: () => Promise<void> = () => Promise.resolve();

	const getDatabase = async () => {
		if (!database) {
			const testDatabaseEnv = await makeTestDatabase();

			database = testDatabaseEnv.database;
			databaseCleanUp = testDatabaseEnv.cleanupHook;

			await initDatabaseSchema(database)
		}

		return database;
	}

	const cleanUp = async () => {
		return databaseCleanUp();
	}

	return { getDatabase, cleanUp };
}

export const makeAllScopes = (): Scopes => [
	{ shareID: testData.shares.library_user1.share_id.toString(), permissions: Permissions.ALL },
	{ shareID: testData.shares.some_share.share_id.toString(), permissions: Permissions.ALL },
]