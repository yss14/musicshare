import { makeTestDatabase } from "./utils/make-test-database";
import { ColumnType, Table, CQLFunc, NativeFunction } from "../table";
import { types as CTypes } from 'cassandra-driver';
import moment = require("moment");
import { sortByTimeUUIDAsc } from "./utils/sort-by-timeuuid";
const Long = require('cassandra-driver').types.Long

const cleanupHooks: (() => Promise<void>)[] = [];

const setupTestEnv = async (columnType: ColumnType, testValues: unknown[]) => {
	const { database, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	const testTable = Table({
		test_table: {
			id: { type: ColumnType.TimeUUID, partitionKey: true },
			test_col: { type: columnType }
		}
	}, 'test_table');
	await database.query(testTable.create());

	for (const testValue of testValues) {
		await database.query(testTable.insert(['id', 'test_col'])([CQLFunc(NativeFunction.Now), testValue]));
	}

	const dbResults = await database.query(testTable.selectAll('*'));
	const queriedValues = dbResults
		.sort((lhs, rhs) => sortByTimeUUIDAsc(lhs.id, rhs.id))
		.map(row => row.test_col);

	return { database, testTable, queriedValues };
}

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('ascii', async () => {
	const testValues: string[] = ['Hello World', '#123', '@123?'];
	const expectedValues = [...testValues];
	const { queriedValues } = await setupTestEnv(ColumnType.ASCII, testValues);

	expect(queriedValues).toEqual(expectedValues);
});

test('bigint', async () => {
	const testValues: number[] = [42, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER];
	const expectedValues = testValues.map(testValue => Long.fromNumber(testValue));
	const { queriedValues } = await setupTestEnv(ColumnType.BigInt, testValues);

	expect(queriedValues).toEqual(expectedValues);
});

test('boolean', async () => {
	const testValues: boolean[] = [true, false];
	const expectedValues = [...testValues];
	const { queriedValues } = await setupTestEnv(ColumnType.Boolean, testValues);

	expect(queriedValues).toEqual(expectedValues);
});

test('date', async () => {
	const testValues: CTypes.LocalDate[] = [new Date(), moment().subtract(53, "seconds").toDate()]
		.map(date => CTypes.LocalDate.fromDate(date));
	const expectedValues = [...testValues];
	const { queriedValues } = await setupTestEnv(ColumnType.Date, testValues);

	expect(queriedValues).toEqual(expectedValues);
});

test('decimal', async () => {
	const testValues: CTypes.BigDecimal[] = [42, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, Math.PI]
		.map(num => CTypes.BigDecimal.fromNumber(num));
	const expectedValues = [...testValues];
	const { queriedValues } = await setupTestEnv(ColumnType.Decimal, testValues);

	expect(queriedValues).toEqual(expectedValues);
});

test('time', async () => {
	const testValues: CTypes.LocalTime[] = [new Date(), moment().subtract(53, "seconds").toDate()]
		.map(date => CTypes.LocalTime.fromDate(date, 0));
	const expectedValues = [...testValues];
	const { queriedValues } = await setupTestEnv(ColumnType.Time, testValues);

	expect(queriedValues).toEqual(expectedValues);
});

test('timestamp', async () => {
	const testValues: Date[] = [new Date(), moment().subtract(53, "seconds").toDate()];
	const expectedValues = [...testValues];
	const { queriedValues } = await setupTestEnv(ColumnType.Timestamp, testValues);

	expect(queriedValues).toEqual(expectedValues);
});

test('timeuuid', async () => {
	const testValues: CTypes.TimeUuid[] = [
		CTypes.TimeUuid.fromDate(new Date()),
		CTypes.TimeUuid.fromDate(moment().subtract(53, "seconds").toDate())
	];
	const expectedValues = [...testValues];
	const { queriedValues } = await setupTestEnv(ColumnType.TimeUUID, testValues);

	expect(queriedValues).toEqual(expectedValues);
});