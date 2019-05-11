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
import { makeTestDatabase, IDatabaseClient } from "cassandra-schema-builder";
import { makeDatabaseSeed, testData } from "../../database/seed";
import { makeDatabaseSchemaWithSeed } from "../../database/schema/make-database-schema";
import { SongTypeService } from "../../services/SongTypeService";
import { GenreService } from "../../services/GenreService";
import { ArtistService } from "../../services/ArtistService";
import { AuthenticationService } from "../../auth/AuthenticationService";
import { PasswordLoginService } from "../../auth/PasswordLoginService";
import uuid = require("uuid");
import { PlaylistResolver } from "../../resolvers/PlaylistResolver";
import { PlaylistService } from "../../services/PlaylistService";
import { makeGraphQLContextProvider, Scopes } from "../../types/context";
import { Permissions } from "../../auth/permissions";
import { PermissionService } from "../../services/PermissionsService";

export interface SetupTestEnvArgs {
	mockDatabase?: IDatabaseClient;
	seedDatabase?: boolean;
}

// tslint:disable:no-parameter-reassignment
export const setupTestEnv = async ({ seedDatabase, mockDatabase }: SetupTestEnvArgs) => {
	seedDatabase = seedDatabase || true;

	const testID = uuid();

	let database: IDatabaseClient = mockDatabase!;
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
	const playlistService = PlaylistService({ database, songService });
	const permissionService = PermissionService({ database });

	const shareResolver = new ShareResolver(shareService, songService, songTypeService, genreService, artistService, playlistService, permissionService);
	const songResolver = new SongResolver(fileService, songService);
	const userResolver = new UserResolver(userService, shareService, passwordLoginService, authService, permissionService);
	const playlistResolver = new PlaylistResolver(playlistService);

	Container.of(testID).set(ShareResolver, shareResolver);
	Container.of(testID).set(SongResolver, songResolver);
	Container.of(testID).set(UserResolver, userResolver);
	Container.of(testID).set(PlaylistResolver, playlistResolver);

	const seed = async (songService: SongService) => {
		const seed = await makeDatabaseSeed({ database, songService, songTypeService, genreService, passwordLoginService, playlistService, permissionService });
		await makeDatabaseSchemaWithSeed(database, seed, { keySpace: databaseKeyspace, clear: true });
	}

	if (!mockDatabase && seedDatabase === true) {
		await seed(songService);
	}

	const authChecker = () => true;

	const graphQLServer = await makeGraphQLServer(
		Container.of(testID),
		makeGraphQLContextProvider({ playlistService, songService, shareService }),
		authChecker,
		UserResolver, ShareResolver, SongResolver
	);

	const allScopes = makeAllScopes();

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
		playlistService,
		allScopes,
	};
}

export const makeAllScopes = (): Scopes => [
	{ shareID: testData.shares.library_user1.id.toString(), permissions: Permissions.ALL },
	{ shareID: testData.shares.some_shared_library.id.toString(), permissions: Permissions.ALL },
];