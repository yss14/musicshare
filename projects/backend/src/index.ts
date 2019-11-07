// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { HTTPServer } from './server/HTTPServer';
import Container from 'typedi';
import { isProductionEnvironment, isValidNodeEnvironment } from "./utils/env/native-envs";
import { loadEnvsFromDotenvFile } from "./utils/env/load-envs-from-file";
import { CustomEnv } from "./utils/env/CustomEnv";
import { tryParseInt } from "./utils/try-parse/try-parse-int";
import { UserResolver } from "./resolvers/UserResolver";
import { ShareResolver } from "./resolvers/ShareResolver";
import { SongResolver } from "./resolvers/SongResolver";
import { makeGraphQLServer } from "./server/GraphQLServer";
import { __DEV__, __PROD__ } from "./utils/env/env-constants";
import { makeDatabaseSchemaWithSeed, makeDatabaseSchema } from "./database/schema/make-database-schema";
import { makeDatabaseSeed, insertProductionSetupSeed } from "./database/seed";
import { graphQLAuthChecker, makeAuthExtractor } from "./auth/auth-middleware";
import { IGraphQLContext, makeGraphQLContextProvider } from "./types/context";
import { PlaylistResolver } from "./resolvers/PlaylistResolver";
import { configFromEnv } from "./types/config";
import { connectAndSetupDatabase } from "./database/core-database";
import { initServices } from "./services/services";
import { FileUploadResolver } from "./resolvers/FileUploadResolver";

require('source-map-support').install();

const nodeEnv = process.env.NODE_ENV;

if (!isValidNodeEnvironment(nodeEnv)) {
	throw new Error(`Invalid node environment ${nodeEnv}`);
}

if (!isProductionEnvironment()) {
	loadEnvsFromDotenvFile(nodeEnv);
}

(async () => {
	const config = configFromEnv();
	const database = await connectAndSetupDatabase(config);

	console.info('Database connected');

	const services = initServices(config, database);

	const shareResolver = new ShareResolver(services);
	const songResolver = new SongResolver(services);
	const userResolver = new UserResolver(services);
	const playlistResolver = new PlaylistResolver(services);
	const fileUploadResolver = new FileUploadResolver(services);

	Container.set(ShareResolver, shareResolver);
	Container.set(SongResolver, songResolver);
	Container.set(UserResolver, userResolver);
	Container.set(PlaylistResolver, playlistResolver);
	Container.set(FileUploadResolver, fileUploadResolver);

	await services.songFileService.createContainerIfNotExists();
	console.info('FileStorage connected');

	const clearDatabase = __DEV__ || config.setup.seed.dbCleanInit;
	const seedDatabase = __DEV__ || config.setup.seed.dbSeed;

	if (seedDatabase) {
		const seed = await makeDatabaseSeed({ database, services });
		await makeDatabaseSchemaWithSeed(database, seed, { databaseUser: config.database.user!, clear: clearDatabase });
	} else {
		await makeDatabaseSchema(database, { databaseUser: config.database.user! });
	}

	if (__PROD__) {
		await insertProductionSetupSeed({ config, services });
	}
	console.info('Database schema created');

	await services.invalidAuthTokenStore.load();
	setTimeout(async () => {
		await services.invalidAuthTokenStore.persist();
	}, 10000);

	const graphQLServer = await makeGraphQLServer<IGraphQLContext>(
		Container,
		makeGraphQLContextProvider(services),
		config,
		graphQLAuthChecker,
		UserResolver, ShareResolver, SongResolver
	);

	const server = HTTPServer({
		graphQLServer,
		songFileService: services.songFileService,
		uploadProcessingQueue: services.songProcessingQueue,
		authExtractor: makeAuthExtractor(services.authService, services.invalidAuthTokenStore)
	});
	const serverPort = tryParseInt(process.env[CustomEnv.REST_PORT], 4000);
	await server.start('/graphql', serverPort);

	console.info(`Server is running on http://localhost:${serverPort}`);
	console.info(`GraphQL endpoint available at http://localhost:${serverPort}/graphql`);
	if (__DEV__) console.info(`GraphQL Playground available at http://localhost:${serverPort}/playground`);
})()
	.then()
	.catch(console.error);