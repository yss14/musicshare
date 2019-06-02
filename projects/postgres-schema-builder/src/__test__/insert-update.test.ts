import { makeTestDatabase } from "./utils/make-test-database";
import { v4 as uuid } from 'uuid';
import moment = require("moment");
import { TestTableAllTypes } from "./fixtures/test-tables";

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

const date1 = new Date();
const date2 = moment().add(5, 'hours').toDate();
const uid = uuid();

test('insert via explicit subset successfully', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableAllTypes.create());

	await database.query(
		TestTableAllTypes.insert(['some_bool', 'some_date', 'some_string', 'some_string_nullable', 'some_timestamp', 'some_uuid'])
			([true, date1, 'hello world', null, date1, uid])
	);
	await database.query(
		TestTableAllTypes.insert(['some_bool', 'some_date', 'some_string', 'some_string_nullable', 'some_timestamp', 'some_uuid'])
			([false, date2, 'hello world 2', null, date2, uid])
	);
});

test('insert from object successfully', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableAllTypes.create());

	await database.query(
		TestTableAllTypes.insertFromObj({
			some_bool: true,
			some_date: date1,
			some_string: 'hello world',
			some_string_nullable: null,
			some_timestamp: date1,
			some_uuid: uid,
		})
	);

	await database.query(
		TestTableAllTypes.insertFromObj({
			some_bool: false,
			some_date: date1,
			some_string: 'hello world 2',
			some_string_nullable: null,
			some_timestamp: date2,
			some_uuid: uid,
		})
	);
});

test('update successfully', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableAllTypes.create());

	await database.query(
		TestTableAllTypes.insertFromObj({
			some_bool: true,
			some_date: date1,
			some_string: 'hello world',
			some_string_nullable: null,
			some_timestamp: date1,
			some_uuid: uid,
		})
	);

	await database.query(
		TestTableAllTypes.update(['some_bool', 'some_date', 'some_string', 'some_string_nullable', 'some_timestamp', 'some_uuid'], ['id'])
			([false, date2, 'hello world 2', null, date2, uid], [1])
	);
});