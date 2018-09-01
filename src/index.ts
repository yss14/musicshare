import { CoreDatabase } from './database/core-database';
import { Database } from "./database/database";
import { Server } from './server';

// enable source map support for error stacks
require('source-map-support').install();

(async () => {
	const database = new Database({
		contactPoints: ['127.0.0.1'],
		keyspace: 'musicshare'
	});

	const coreDatabase = new CoreDatabase(database);

	await coreDatabase.createSchema({ clear: true });

	console.info('Database schema created');

	const server = new Server();
	await server.start('/graphql', 4000);

	console.info(`Server is running, GraphQL Playground available at http://localhost:4000/playground`);
})();