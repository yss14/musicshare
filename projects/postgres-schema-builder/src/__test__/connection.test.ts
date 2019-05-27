import { makeTestDatabase } from "./utils/make-test-database";

test('successful connection', async () => {
	const { database, cleanupHook } = await makeTestDatabase();

	const result = await database.query({ sql: 'SELECT 1;' });

	expect(result).toBeArrayOfSize(1);

	await cleanupHook();
});