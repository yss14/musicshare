// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { setupTestEnv } from "./utils/setup-test-env";
import { HTTPServer } from "../server/HTTPServer";
import { findFreePort } from "./utils/find-free-port";

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('start http server', async () => {
	const { graphQLServer, fileService, songUploadProcessingQueue, cleanUp } = await setupTestEnv({ seedDatabase: false, startServer: false });
	cleanupHooks.push(cleanUp);

	const httpServer = await HTTPServer.makeServer(graphQLServer, fileService, songUploadProcessingQueue);
	const port = await findFreePort();

	await expect(httpServer.start('graphqltest', port)).toResolve();

	await httpServer.stop();
});