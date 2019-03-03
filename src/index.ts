// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { SongUploadProcessingQueue } from './job-queues/SongUploadProcessingQueue';
import { DatabaseConnection } from "./database/DatabaseConnection";
import { HTTPServer } from './server/HTTPServer';
import { useContainer } from 'type-graphql';
import Container from 'typedi';
import { isProductionEnvironment, isValidNodeEnvironment } from "./utils/env/native-envs";
import { loadEnvsFromDotenvFile } from "./utils/env/load-envs-from-file";
import { CustomEnv } from "./utils/env/CustomEnv";
import { tryParseInt } from "./utils/try-parse/try-parse-int";
import { UserResolver } from "./resolvers/UserResolver";
import { ShareResolver } from "./resolvers/ShareResolver";
import { SongResolver } from "./resolvers/SongResolver";
import { makeGraphQLServer } from "./server/GraphQLServer";
import { AzureFileService } from "./file-service/AzureFileService";
import { __DEV__, __PROD__ } from "./utils/env/env-constants";
import { SongMetaDataService } from "./utils/song-meta/SongMetaDataService";
import { ID3MetaData } from "./utils/song-meta/song-meta-formats/ID3MetaData";
import { makeDatabaseSchemaWithSeed, makeDatabaseSchema } from "./database/schema/make-database-schema";
import { makeDatabaseSeed } from "./database/seed";
import { SongService } from "./services/SongService";
import { ShareService } from "./services/ShareService";
import { UserService } from "./services/UserService";

// enable source map support for error stacks
require('source-map-support').install();

// load environment variables
const nodeEnv = process.env.NODE_ENV;

if (!isValidNodeEnvironment(nodeEnv)) {
	throw new Error(`Invalid node environment ${nodeEnv}`);
}

if (!isProductionEnvironment()) {
	loadEnvsFromDotenvFile(nodeEnv);
}

(async () => {
	useContainer(Container);

	const databaseHost = process.env[CustomEnv.CASSANDRA_HOST] || '127.0.0.1';
	const databaseKeyspace = process.env[CustomEnv.CASSANDRA_KEYSPACE] || 'musicshare';
	const database = new DatabaseConnection({
		contactPoints: [databaseHost],
		keyspace: databaseKeyspace
	});

	Container.set('DATABASE_CONNECTION', database);

	console.info('Database schema created');

	const fileService = await AzureFileService.makeService('songs');
	const songService = new SongService(database);
	const shareService = new ShareService(database);
	const userService = new UserService(database);
	const songMetaDataService = new SongMetaDataService([new ID3MetaData()]);
	const songProcessingQueue = new SongUploadProcessingQueue(songService, fileService, songMetaDataService);

	Container.set('FILE_SERVICE', fileService);
	Container.set('SONG_SERVICE', songService);
	Container.set('SHARE_SERVICE', shareService);
	Container.set('USER_SERVICE', userService);

	if (__DEV__) {
		const seed = await makeDatabaseSeed(database, songService);
		await makeDatabaseSchemaWithSeed(database, seed, { keySpace: databaseKeyspace, clear: true });
	} else if (__PROD__) {
		await makeDatabaseSchema(database, { keySpace: databaseKeyspace });
	}

	const graphQLServer = await makeGraphQLServer(UserResolver, ShareResolver, SongResolver);

	const server = await HTTPServer.makeServer(graphQLServer, fileService, songProcessingQueue);
	const serverPort = tryParseInt(process.env[CustomEnv.REST_PORT], 4000);
	await server.start('/graphql', serverPort, !__PROD__);

	console.info(`Server is running on http://localhost:${serverPort}`);
	console.info(`GraphQL endpoint available at http://localhost:${serverPort}/graphql`);
	if (__DEV__) console.info(`GraphQL Playground available at http://localhost:${serverPort}/playground`);
})()
	.then()
	.catch(console.error);