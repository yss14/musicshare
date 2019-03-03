import { getSchemaTables, clearKeySpace, makeDatabaseSchema } from "../database/schema/make-database-schema";
import { makeTestDatabase } from "./utils/make-test-database";

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('clear keyspace', async () => {
	const { database, databaseKeyspace, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	await makeDatabaseSchema(database, { keySpace: databaseKeyspace });
	await clearKeySpace(database, databaseKeyspace);

	const currentTables = await getSchemaTables(database, databaseKeyspace);

	expect(currentTables).toEqual([]);
});