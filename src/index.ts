import "reflect-metadata";
import { SongProcessingQueue } from './job-queues/song-processing.queue';
import { CoreDatabase } from './database/CoreDatabase';
import { DatabaseConnection } from "./database/DatabaseConnection";
import { Server } from './server/server';
import { useContainer } from 'type-graphql';
import Container from 'typedi';
import { BlobService } from './server/file-uploader';
import { SongService } from "./services/song.service";
import { isProductionEnvironment, isValidNodeEnvironment } from "./utils/env/native-envs";
import { loadEnvsFromDotenvFile } from "./utils/env/load-envs-from-file";
import { CustomEnv } from "./utils/env/CustomEnv";
import { tryParseInt } from "./utils/try-parse/try-parse-int";

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
	const database = new DatabaseConnection({
		contactPoints: [databaseHost],
		keyspace: databaseKeyspace
	});

	const coreDatabase = new CoreDatabase();

	await coreDatabase.createSchema({ clear: true });

	console.info('Database schema created');

	const songProcessingQueue = new SongProcessingQueue();
	const fileUploadService = new BlobService(songProcessingQueue);

	try {
		await fileUploadService.createContainer('songs');
	} catch (err) {
		if (err.message.indexOf('ContainerAlreadyExists') === -1) {
			console.error(err);
		}
	}

	// setup dependency injection
	// register 3rd party IOC container
	useContainer(Container);

	Container.set({ id: 'DATABASE', factory: () => database });
	Container.set({ id: 'FILE_UPLOAD', factory: () => fileUploadService });

	const server = new Server(database, fileUploadService);
	const serverPort = tryParseInt(process.env[CustomEnv.REST_PORT], 4000);
	await server.start('/graphql', serverPort);

	console.info(`Server is running, GraphQL Playground available at http://localhost:${serverPort}/playground`);
})();