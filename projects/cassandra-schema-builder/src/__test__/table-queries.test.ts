import { types as CTypes } from 'cassandra-driver';
import { makeTestDatabase } from "./utils/make-test-database";
import { ColumnType, TableSchema, Table, NativeFunction, CQLFunc, TableRecord } from "../table";

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

const testTableSchema = TableSchema({
	col_id: { type: ColumnType.TimeUUID, partitionKey: true },
	col_string: { type: ColumnType.Varchar, nullable: false },
	col_boolean: { type: ColumnType.Boolean, nullable: false },
});

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

describe('select', () => {
	const id1 = CTypes.TimeUuid.fromDate(new Date(), 1);
	const id2 = CTypes.TimeUuid.fromDate(new Date(), 2);

	test('selectAll *', async () => {
		const { database, testTable } = await setupTestEnv();

		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id1, 'teststring', true]));
		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id2, 'teststring2', false]));

		const result = await database.query(testTable.selectAll('*'));

		expect(result).toMatchObject([
			{ col_id: id1, col_string: 'teststring', col_boolean: true },
			{ col_id: id2, col_string: 'teststring2', col_boolean: false },
		]);
	});

	test('selectAll subset', async () => {
		const { database, testTable } = await setupTestEnv();

		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id1, 'teststring', true]));
		await database.query(testTable.insert(['col_id', 'col_string', 'col_boolean'])([id2, 'teststring2', false]));

		const result = await database.query(testTable.selectAll(['col_id', 'col_string']));

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
});