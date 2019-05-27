import { makeTestDatabase } from "./utils/make-test-database";
import { TestTableAllTypes } from "./fixtures/test-tables";
import moment = require("moment");
import { v4 as uuid } from 'uuid';

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

const date1 = new Date();
const date2 = moment().add(5, 'hours').toDate();
const uid = uuid();

const dataset1 = {
	some_bool: true,
	some_date: date1,
	some_string: 'hello world',
	some_string_nullable: null,
	some_timestamp: date1,
	some_uuid: uid,
};
const dataset2 = {
	some_bool: false,
	some_date: date1,
	some_string: 'hello world 2',
	some_string_nullable: null,
	some_timestamp: date2,
	some_uuid: uid,
};

test('select all returns results', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableAllTypes.create());

	await database.query(TestTableAllTypes.insertFromObj(dataset1));
	await database.query(TestTableAllTypes.insertFromObj(dataset2));

	const results = await database.query(TestTableAllTypes.selectAll('*'));

	expect(results).toEqual([
		{ ...dataset1, some_date: moment(date1).format('YYYY-MM-DD'), id: 1 },
		{ ...dataset2, some_date: moment(date2).format('YYYY-MM-DD'), id: 2 },
	]);
});

test('select all returns empty result', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableAllTypes.create());

	const results = await database.query(TestTableAllTypes.selectAll('*'));

	expect(results).toEqual([]);
});

test('select where returns results', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTableAllTypes.create());

	await database.query(TestTableAllTypes.insertFromObj(dataset1));
	await database.query(TestTableAllTypes.insertFromObj(dataset2));

	const results = await database.query(
		TestTableAllTypes.select('*', ['id', 'some_string'])
			([1, 'hello world'])
	);

	expect(results).toEqual([
		{ ...dataset1, some_date: moment(date1).format('YYYY-MM-DD'), id: 1 },
	]);
});