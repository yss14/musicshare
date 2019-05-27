import { TableSchema, ColumnType, Table } from "../table";
import { makeTestDatabase } from "./utils/make-test-database";
import { v4 as uuid } from 'uuid';
import moment = require("moment");

namespace TestTables {
	export const test_table = TableSchema({
		id: { type: ColumnType.Integer, primaryKey: true, autoIncrement: true },
		some_string: { type: ColumnType.Varchar, nullable: false },
		some_string_nullable: { type: ColumnType.Varchar, nullable: true },
		some_bool: { type: ColumnType.Boolean, nullable: false },
		some_date: { type: ColumnType.Date, nullable: false },
		some_timestamp: { type: ColumnType.TimestampTZ, nullable: false },
		some_uuid: { type: ColumnType.UUID, nullable: false },
	});
}

const TestTable = Table(TestTables, 'test_table');

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('insert via explicit subset successfully', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTable.create());

	const date1 = new Date();
	const date2 = moment().add(5, 'hours').toDate();
	const uid = uuid();

	await database.query(
		TestTable.insert(['some_bool', 'some_date', 'some_string', 'some_string_nullable', 'some_timestamp', 'some_uuid'])
			([true, date1, 'hello world', null, date1, uid])
	);
	await database.query(
		TestTable.insert(['some_bool', 'some_date', 'some_string', 'some_string_nullable', 'some_timestamp', 'some_uuid'])
			([false, date2, 'hello world 2', null, date2, uid])
	);
});

test('insert from object successfully', async () => {
	const { database, cleanupHook } = await makeTestDatabase();
	cleanupHooks.push(cleanupHook);

	await database.query(TestTable.create());

	const date1 = new Date();
	const date2 = moment().add(5, 'hours').toDate();
	const uid = uuid();

	await database.query(
		TestTable.insertFromObj({
			some_bool: true,
			some_date: date1,
			some_string: 'hello world',
			some_string_nullable: null,
			some_timestamp: date1,
			some_uuid: uid,
		})
	);

	await database.query(
		TestTable.insertFromObj({
			some_bool: false,
			some_date: date1,
			some_string: 'hello world 2',
			some_string_nullable: null,
			some_timestamp: date2,
			some_uuid: uid,
		})
	);
});