import { makeTestDatabase } from "./utils/make-test-database";
import { testTableWithAllPrimitives, testTableWithAllSets, testTableWithAllLists } from "./utils/test-tables";
import { TableSchema, ColumnType, Table } from "../table";

const cleanupHooks: (() => Promise<void>)[] = [];

afterAll(async () => {
	await Promise.all(cleanupHooks.map(hook => hook()));
});

test('create table with all available primitive data types', async () => {
	const { database, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	await expect(database.query(testTableWithAllPrimitives.create())).resolves.toBe(undefined);
});

test('create table with all available set data types', async () => {
	const { database, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	await expect(database.query(testTableWithAllSets.create())).resolves.toBe(undefined);
});

test('create table with all available list data types', async () => {
	const { database, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	await expect(database.query(testTableWithAllLists.create())).resolves.toBe(undefined);
});

test('schema primary key missing', async () => {
	const { database, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	const tableWithoutPrimaryKeySchema = TableSchema({
		some_col: { type: ColumnType.Int, nullable: false },
	});
	const tableWithoutPrimaryKey = Table({ table_without_primarykey: tableWithoutPrimaryKeySchema }, 'table_without_primarykey');

	try {
		await database.query(tableWithoutPrimaryKey.create());
	} catch (err) {
		expect(err.message)
			.toBe('Cannot create table table_without_primarykey due to invalid schema: No primary key defined');
	}
});

test('schema with mixed clustering keys', async () => {
	const { database, cleanUp } = await makeTestDatabase();
	cleanupHooks.push(cleanUp);

	const tableWithClusteringOrderSchema = TableSchema({
		some_col: { type: ColumnType.Int, partitionKey: true },
		some_cluster_col: { type: ColumnType.Int, clusteringKey: true, clusteringOrder: 'asc' },
		some_other_cluster_col: { type: ColumnType.Int, clusteringKey: true, clusteringOrder: { index: 0, order: 'desc' } },
		some_yet_other_cluster_col: { type: ColumnType.Int, clusteringKey: true, clusteringOrder: { index: 1, order: 'desc' } },
	});
	const tableWithClusteringOrder = Table({ table_without_primarykey: tableWithClusteringOrderSchema }, 'table_without_primarykey');

	expect(tableWithClusteringOrder.create().cql
		.includes('WITH CLUSTERING ORDER BY (some_other_cluster_col DESC, some_yet_other_cluster_col DESC, some_cluster_col ASC)'))
		.toBeTruthy()
	await expect(database.query(tableWithClusteringOrder.create())).resolves.toBe(undefined);
});
