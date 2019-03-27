import { makeTestDatabase } from 'cassandra-schema-builder';
import { clearKeySpace, makeDatabaseSchema } from "../database/schema/make-database-schema";
import { Tables } from '../database/schema/system-tables';

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('clear keyspace', async () => {
	const { database, databaseKeyspace, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	await makeDatabaseSchema(database, { keySpace: databaseKeyspace });
	await clearKeySpace(database, databaseKeyspace);

	const currentTables = await database.query(Tables.select('*', ['keyspace_name'])([databaseKeyspace]));

	expect(currentTables).toEqual([]);
});