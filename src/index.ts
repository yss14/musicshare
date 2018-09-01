import { CoreDatabase } from './database/core-database';
import { Database } from "./database/database";

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
})();