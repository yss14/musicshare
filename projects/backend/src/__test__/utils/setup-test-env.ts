// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { SongService } from "../../services/SongService";
import { UserService } from "../../services/UserService";
import { ShareService } from "../../services/ShareService";
import Container from "typedi";
import { makeGraphQLServer } from "../../server/GraphQLServer";
import { ShareResolver } from "../../resolvers/ShareResolver";
import { SongResolver } from "../../resolvers/SongResolver";
import { UserResolver } from "../../resolvers/UserResolver";
import { FileServiceMock } from "../mocks/FileServiceMock";
import { ISongMetaDataService } from "../../utils/song-meta/SongMetaDataService";
import { SongUploadProcessingQueue } from "../../job-queues/SongUploadProcessingQueue";
import { makeTestDatabase } from "cassandra-schema-builder";
import { makeDatabaseSeed } from "../../database/seed";
import { makeDatabaseSchemaWithSeed } from "../../database/schema/make-database-schema";
import { SongTypeService } from "../../services/SongTypeService";
import { GenreService } from "../../services/GenreService";
import { ArtistService } from "../../services/ArtistService";
import { makeMockedDatabase } from "../mocks/mock-database";
import { AuthenticationService } from "../../auth/AuthenticationService";
import { PasswordLoginService } from "../../auth/PasswordLoginService";
import uuid = require("uuid");

interface SetupTestEnvArgs {
	mockDatabase?: boolean;
	seedDatabase?: boolean;
}

// tslint:disable:no-parameter-reassignment
export const setupTestEnv = async ({ seedDatabase, mockDatabase }: SetupTestEnvArgs) => {
	seedDatabase = seedDatabase || true;
	mockDatabase = mockDatabase || false;

	const testID = uuid();

	let database = makeMockedDatabase();
	let databaseKeyspace = '';
	let cleanUp = async (): Promise<void> => undefined;

	if (!mockDatabase) {
		({ database, cleanUp, databaseKeyspace } = await makeTestDatabase());
	}

	const songService = new SongService(database);
	const userService = new UserService(database);
	const shareService = new ShareService(database);
	const fileService = new FileServiceMock(() => undefined, () => 'http://someurl.de/file.mp3');
	const songMetaDataService: ISongMetaDataService = { analyse: async () => ({}) };
	const songTypeService = new SongTypeService(database);
	const artistService = new ArtistService(songService);
	const genreService = new GenreService(database);
	const songUploadProcessingQueue = new SongUploadProcessingQueue(songService, fileService, songMetaDataService, songTypeService);
	const authService = new AuthenticationService('dev_secret');
	const passwordLoginService = PasswordLoginService({ authService, database, userService });

	const shareResolver = new ShareResolver(shareService, songService, songTypeService, genreService, artistService);
	const songResolver = new SongResolver(fileService, songService);
	const userResolver = new UserResolver(userService, shareService, passwordLoginService);

	Container.of(testID).set(ShareResolver, shareResolver);
	Container.of(testID).set(SongResolver, songResolver);
	Container.of(testID).set(UserResolver, userResolver);

	const seed = async (songService: SongService) => {
		const seed = await makeDatabaseSeed({ database, songService, songTypeService, genreService, passwordLoginService });
		await makeDatabaseSchemaWithSeed(database, seed, { keySpace: databaseKeyspace, clear: true });
	}

	if (!mockDatabase && seedDatabase === true) {
		await seed(songService);
	}

	const authChecker = () => true;

	const graphQLServer = await makeGraphQLServer(Container.of(testID), authChecker, UserResolver, ShareResolver, SongResolver);

	return {
		graphQLServer,
		database,
		cleanUp,
		fileService,
		shareService,
		userService,
		songService,
		songUploadProcessingQueue,
		songTypeService,
		genreService,
		artistService,
		authService,
		passwordLoginService,
	};
}