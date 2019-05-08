// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { SongUploadProcessingQueue } from './job-queues/SongUploadProcessingQueue';
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
import { AzureFileService } from "./file-service/AzureFileService";
import { __DEV__, __PROD__ } from "./utils/env/env-constants";
import { SongMetaDataService } from "./utils/song-meta/SongMetaDataService";
import { ID3MetaData } from "./utils/song-meta/song-meta-formats/id3/ID3MetaData";
import { makeDatabaseSchemaWithSeed, makeDatabaseSchema } from "./database/schema/make-database-schema";
import { makeDatabaseSeed } from "./database/seed";
import { SongService } from "./services/SongService";
import { ShareService } from "./services/ShareService";
import { UserService } from "./services/UserService";
import { ArtistExtractor } from "./utils/song-meta/song-meta-formats/id3/ArtistExtractor";
import { DatabaseClient, CQL, Query } from "cassandra-schema-builder";
import { Client, auth } from "cassandra-driver";
import { SongTypeService } from "./services/SongTypeService";
import { GenreService } from "./services/GenreService";
import { ArtistService } from "./services/ArtistService";
import { graphQLAuthChecker, makeAuthExtractor } from "./auth/auth-middleware";
import { IGraphQLContext, makeGraphQLContextProvider } from "./types/context";
import { PasswordLoginService } from "./auth/PasswordLoginService";
import { AuthenticationService } from "./auth/AuthenticationService";
import { v4 as uuid } from 'uuid';
import { MP3SongDuration } from "./utils/song-meta/song-meta-formats/id3/MP3SongDuration";
import { PlaylistService } from "./services/PlaylistService";
import { PlaylistResolver } from "./resolvers/PlaylistResolver";
import { AuthTokenStore } from "./auth/AuthTokenStore";

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
	const databaseHost = process.env[CustomEnv.CASSANDRA_HOST] || '127.0.0.1';
	const databaseKeyspace = process.env[CustomEnv.CASSANDRA_KEYSPACE] || 'musicshare';
	const databasePassword = process.env[CustomEnv.CASSANDRA_PASSWORD];
	const databaseUser = process.env[CustomEnv.CASSANDRA_USER];
	let authProvider: auth.AuthProvider | null = null;

	if (databasePassword && databaseUser) {
		authProvider = new auth.PlainTextAuthProvider(databaseUser, databasePassword);
	}

	const databaseWithoutKeyspace = new DatabaseClient(
		new Client({
			contactPoints: [databaseHost],
			localDataCenter: 'datacenter1',
			authProvider: authProvider || undefined
		})
	);

	await databaseWithoutKeyspace.query(Query(CQL.createKeyspace(databaseKeyspace)));
	await databaseWithoutKeyspace.close();

	const database = new DatabaseClient(
		new Client({
			contactPoints: [databaseHost],
			localDataCenter: 'datacenter1',
			keyspace: databaseKeyspace,
			authProvider: authProvider || undefined
		})
	);

	Container.set('DATABASE_CONNECTION', database);

	console.info('Database schema created');

	const fileService = await AzureFileService.makeService('songs');
	const songService = new SongService(database);
	const shareService = new ShareService(database);
	const userService = new UserService(database);
	const songTypeService = new SongTypeService(database);
	const genreService = new GenreService(database);
	const artistService = new ArtistService(songService);
	const artistExtractor = new ArtistExtractor();
	const songMetaDataService = new SongMetaDataService([
		new ID3MetaData(artistExtractor),
		new MP3SongDuration()
	]);
	const songProcessingQueue = new SongUploadProcessingQueue(songService, fileService, songMetaDataService, songTypeService);
	const authService = new AuthenticationService(process.env[CustomEnv.JWT_SECRET] || uuid());
	const passwordLoginService = PasswordLoginService({ authService, database, userService });
	const playlistService = PlaylistService({ database, songService });
	const invalidAuthTokenStore = AuthTokenStore({ database, tokenDescription: 'authtoken' });

	const shareResolver = new ShareResolver(shareService, songService, songTypeService, genreService, artistService, playlistService);
	const songResolver = new SongResolver(fileService, songService);
	const userResolver = new UserResolver(userService, shareService, passwordLoginService);
	const playlistResolver = new PlaylistResolver(playlistService);

	Container.set(ShareResolver, shareResolver);
	Container.set(SongResolver, songResolver);
	Container.set(UserResolver, userResolver);
	Container.set(PlaylistResolver, playlistResolver);

	if (__DEV__) {
		const seed = await makeDatabaseSeed({ database, songService, songTypeService, genreService, passwordLoginService, playlistService });
		await makeDatabaseSchemaWithSeed(database, seed, { keySpace: databaseKeyspace, clear: true });
	} else if (__PROD__) {
		await makeDatabaseSchema(database, { keySpace: databaseKeyspace });
	}

	const graphQLServer = await makeGraphQLServer<IGraphQLContext>(
		Container,
		makeGraphQLContextProvider({ playlistService, songService, shareService }),
		graphQLAuthChecker,
		UserResolver, ShareResolver, SongResolver
	);

	const server = HTTPServer({
		graphQLServer,
		fileService,
		uploadProcessingQueue: songProcessingQueue,
		authExtractor: makeAuthExtractor(authService, invalidAuthTokenStore)
	});
	const serverPort = tryParseInt(process.env[CustomEnv.REST_PORT], 4000);
	await server.start('/graphql', serverPort);

	console.info(`Server is running on http://localhost:${serverPort}`);
	console.info(`GraphQL endpoint available at http://localhost:${serverPort}/graphql`);
	if (__DEV__) console.info(`GraphQL Playground available at http://localhost:${serverPort}/playground`);
})()
	.then()
	.catch(console.error);