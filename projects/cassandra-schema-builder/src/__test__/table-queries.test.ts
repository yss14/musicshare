import { types as CTypes } from 'cassandra-driver';
import { makeTestDatabase } from "./utils/make-test-database";
import { ColumnType, TableSchema, Table, NativeFunction, CQLFunc, TableRecord } from "../table";
import { sortByTimeUUIDAsc } from './utils/sort-by-timeuuid';
import moment = require('moment');

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

const testTableSchema = TableSchema({
	col_id: { type: ColumnType.TimeUUID, partitionKey: true },
	col_string: { type: ColumnType.Varchar, nullable: false },
	col_boolean: { type: ColumnType.Boolean, nullable: false },
});

const obj1: ITestTableDBResult = {
	col_id: CTypes.TimeUuid.fromDate(new Date(), 1),
	col_boolean: false,
	col_string: 'teststring1'
};
const obj2: ITestTableDBResult = {
	col_id: CTypes.TimeUuid.fromDate(new Date(), 2),
	col_boolean: true,
	col_string: 'teststring2'
};

interface ITestTableDBResult extends TableRecord<typeof testTableSchema> { }

const setupTestEnv = async () => {
	const testTable = Table({ test_table: testTableSchema }, 'test_table');
	const { database, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	await database.query(testTable.create());

	return { database, testTable };
}

describe('insert', () => {
	test('insert with cql function', async () => {
		const { database, testTable } = await setupTestEnv();

		await expect(database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([CQLFunc(NativeFunction.Now), 'teststring', true])))
			.resolves.toBeUndefined();
	});

	test('insert all values prepared statement', async () => {
		const { database, testTable } = await setupTestEnv();

		const id = CTypes.TimeUuid.fromDate(new Date(), 1);

		await expect(database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id, 'teststring', true])))
			.resolves.toBeUndefined();
	});

	test('insert from object', async () => {
		const { database, testTable } = await setupTestEnv();

		const obj: ITestTableDBResult = {
			col_id: CTypes.TimeUuid.fromDate(new Date(), 1),
			col_boolean: false,
			col_string: 'teststring'
		};

		await expect(database.query(testTable.insertFromObj(obj))).resolves.toBeUndefined();
	});
});

describe('update', () => {
	test('update where', async () => {
		const { database, testTable } = await setupTestEnv();
		await database.query(testTable.insertFromObj(obj1));
		await database.query(testTable.insertFromObj(obj2));

		await database.query(testTable.update(
			['col_boolean', 'col_string'], ['col_id'])([false, 'newstring'], [obj2.col_id]));

		const dbResult = await database.query(testTable.selectAll('*'));

		expect(dbResult.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.col_id, rhs.col_id))).toEqual([
			{ ...obj1 },
			{ ...obj2, col_boolean: false, col_string: 'newstring' },
		]);
	});

	test('update if exists false', () => {
		const testTable = Table({ test_table: testTableSchema }, 'test_table');
		const id = CTypes.TimeUuid.fromDate(new Date(), 1);
		const updateQuery = testTable.update(['col_boolean'], ['col_id'], { ifExists: false })([false], [id]);

		expect(updateQuery.cql).toBe(`UPDATE test_table SET col_boolean = ? WHERE col_id = ? ;`);
	});
});

describe('select', () => {
	const id1 = CTypes.TimeUuid.fromDate(new Date());
	const id2 = CTypes.TimeUuid.fromDate(moment().add(2, 'seconds').toDate());

	test('selectAll *', async () => {
		const { database, testTable } = await setupTestEnv();

		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id1, 'teststring', true]));
		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id2, 'teststring2', false]));

		const result = (await database.query(testTable.selectAll('*')))
			.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.col_id, rhs.col_id));

		expect(result).toMatchObject([
			{ col_id: id1, col_string: 'teststring', col_boolean: true },
			{ col_id: id2, col_string: 'teststring2', col_boolean: false },
		]);
	});

	test('selectAll subset', async () => {
		const { database, testTable } = await setupTestEnv();

		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id1, 'teststring', true]));
		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id2, 'teststring2', false]));

		const result = (await database.query(testTable.selectAll(['col_id', 'col_string'])))
			.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.col_id, rhs.col_id));

		expect(result).toMatchObject([
			{ col_id: id1, col_string: 'teststring' },
			{ col_id: id2, col_string: 'teststring2' },
		]);
	});

	test('select * where', async () => {
		const { database, testTable } = await setupTestEnv();

		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id1, 'teststring', true]));
		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id2, 'teststring2', false]));

		const result = await database.query(testTable.select('*', ['col_id'])([id1]));

		expect(result).toMatchObject([
			{ col_id: id1, col_string: 'teststring', col_boolean: true },
		]);
	});

	test('select subset where', async () => {
		const { database, testTable } = await setupTestEnv();

		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id1, 'teststring', true]));
		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id2, 'teststring2', false]));

		const result = await database.query(testTable.select(['col_id', 'col_string'], ['col_id'])([id2]));

		expect(result).toMatchObject([
			{ col_id: id2, col_string: 'teststring2' },
		]);
	});

	test('select subset where allowFiltering', async () => {
		const { database, testTable } = await setupTestEnv();

		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id1, 'teststring', true]));
		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id2, 'teststring2', false]));

		const result = await database.query(testTable.select(['col_id', 'col_string'], ['col_boolean'], true)([false]));

		expect(result).toMatchObject([
			{ col_id: id2, col_string: 'teststring2' },
		]);
	});

	test('select custom where', async () => {
		const testTable = Table({ test_table: testTableSchema }, 'test_table');
		const customWhere = 'some_key > ? AND some_other_key = ?;';
		const customValues = [42, 'hello'];
		const query = testTable.selectWhere(customWhere)(customValues);

		expect(query.cql).toBe(`SELECT * FROM test_table WHERE ${customWhere};`);
		expect(query.values).toEqual(customValues);
	});
});

describe('drop', () => {
	test('drop existing table', async () => {
		const { database, testTable } = await setupTestEnv();

		await expect(database.query(testTable.drop())).resolves.toBe(undefined);
	});
});

describe('batch', () => {
	test('valid insert batch', async () => {
		const { database, testTable } = await setupTestEnv();
		const queries = [
			testTable.insert(['col_id', 'col_string', 'col_boolean'])([CQLFunc(NativeFunction.Now), 'teststring1', true]),
			testTable.insert(['col_id', 'col_string', 'col_boolean'])([CQLFunc(NativeFunction.Now), 'teststring2', true]),
			testTable.insert(['col_id', 'col_string', 'col_boolean'])([CQLFunc(NativeFunction.Now), 'teststring3', false]),
		];

		await database.query(testTable.batch(queries));
	});

	test('valid update batch', async () => {
		const { database, testTable } = await setupTestEnv();
		await database.query(testTable.insertFromObj(obj1));
		await database.query(testTable.insertFromObj(obj2));

		const queries = [
			testTable.update(['col_boolean', 'col_string'], ['col_id'])([true, 'newstring1'], [obj1.col_id]),
			testTable.update(['col_boolean', 'col_string'], ['col_id'])([true, 'newstring1'], [obj1.col_id]),
		];

		await database.query(testTable.batch(queries));

		const dbResult = await database.query(testTable.selectAll('*'));

		expect(dbResult.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.col_id, rhs.col_id))).toEqual([
			{ ...obj1, col_boolean: true, col_string: 'newstring1' },
			{ ...obj2 },
		]);
	});

	test('illegal select batch', async () => {
		const testTable = Table({ test_table: testTableSchema }, 'test_table');
		const queries = [
			testTable.insert(['col_boolean'])([true]),
			testTable.select('*', ['col_boolean'])([true])
		];

		expect(() => testTable.batch(queries)).toThrowError('Queries contains an illegal SELECT statement');
	});

	test('illegal drop batch', async () => {
		const testTable = Table({ test_table: testTableSchema }, 'test_table');
		const queries = [
			testTable.insert(['col_boolean'])([true]),
			testTable.drop()
		];

		expect(() => testTable.batch(queries)).toThrowError('Queries contains an illegal DROP statement');
	});

	test('illegal create batch', async () => {
		const testTable = Table({ test_table: testTableSchema }, 'test_table');
		const queries = [
			testTable.insert(['col_boolean'])([true]),
			testTable.create()
		];

		expect(() => testTable.batch(queries)).toThrowError('Queries contains an illegal CREATE statement');
	});
});