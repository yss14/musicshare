import { makeTestDatabase } from "./make-test-database";
import { SongService } from "../../services/SongService";
import { UserService } from "../../services/UserService";
import { ShareService } from "../../services/ShareService";
import { useContainer } from "type-graphql";
import Container from "typedi";
import { makeGraphQLServer } from "../../server/GraphQLServer";
import { ShareResolver } from "../../resolvers/ShareResolver";
import { SongResolver } from "../../resolvers/SongResolver";
import { UserResolver } from "../../resolvers/UserResolver";
import { FileServiceMock } from "../mocks/FileServiceMock";

export const setupTestEnv = async () => {
	const { database, cleanUp, seed } = await makeTestDatabase();

	const songService = new SongService(database);
	const userService = new UserService(database);
	const shareService = new ShareService(database);
	useContainer(Container);
	Container.set('USER_SERVICE', userService);
	Container.set('SHARE_SERVICE', shareService);
	Container.set('SONG_SERVICE', songService);
	Container.set('FILE_SERVICE', new FileServiceMock(() => undefined, () => ''));

	await seed(songService);

	const graphQLServer = await makeGraphQLServer(UserResolver, ShareResolver, SongResolver);
	await graphQLServer.createHttpServer({});

	return { graphQLServer, database, cleanUp };
}