import { SongProcessingQueue } from './job-queues/song-processing.queue';
import { CoreDatabase } from './database/core-database';
import { Database } from "./database/database";
import { Server } from './server/server';
import { useContainer } from 'type-graphql';
import Container from 'typedi';
import { BlobService } from './server/file-uploader';
import { NodeEnv } from './types/common-types';
import * as dotenv from 'dotenv';

// enable source map support for error stacks
require('source-map-support').install();

// load environment variables
if (process.env.NODE_ENV === NodeEnv.Development || process.env.NODE_ENV === NodeEnv.Testing) {
	dotenv.load({
		path: `./${process.env.NODE_ENV}.env`
	});
}

(async () => {
	const database = new Database({
		contactPoints: ['127.0.0.1'],
		keyspace: 'musicshare'
	});

	const coreDatabase = new CoreDatabase(database);

	await coreDatabase.createSchema({ clear: true });

	console.info('Database schema created');

	const songProcessingQueue = new SongProcessingQueue();
	const fileUploadService = new BlobService(songProcessingQueue);

	// setup dependency injection
	// register 3rd party IOC container
	useContainer(Container);

	Container.set({ id: 'DATABASE', factory: () => database });
	Container.set({ id: 'FILE_UPLOAD', factory: () => fileUploadService });

	const server = new Server(database, fileUploadService);
	await server.start('/graphql', 4000);

	console.info(`Server is running, GraphQL Playground available at http://localhost:4000/playground`);
})();