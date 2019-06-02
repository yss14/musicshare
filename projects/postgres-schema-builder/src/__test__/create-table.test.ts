import { makeTestDatabase } from "./utils/make-test-database";
import { TestTableA, TestTableB } from "./fixtures/test-tables";

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('create tables successfully', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableA.create());
	await database.query(TestTableB.create());
});

test('drop table successfully', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableA.create());
	await database.query(TestTableB.create());

	await database.query(TestTableB.drop());
	await database.query(TestTableA.drop());
});