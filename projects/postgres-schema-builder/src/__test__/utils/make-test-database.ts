import { postgresConfigFromEnv, DatabaseClient } from "../../database-client";
import { Pool } from "pg";
import { v4 as uuid } from 'uuid';

export const makeTestDatabase = async () => {
	const clientConfigWithoutDatabase = postgresConfigFromEnv();
	clientConfigWithoutDatabase.database = undefined;

	const clientWithoutDatabase = new Pool(clientConfigWithoutDatabase);
	const testDatabaseName = 'test_' + uuid().split('-').join('');

	await clientWithoutDatabase.query({ text: `CREATE DATABASE ${testDatabaseName};` });

	const database = DatabaseClient(new Pool({ ...clientConfigWithoutDatabase, database: testDatabaseName }));

	const cleanupHook = async () => {
		await database.close();
		await clientWithoutDatabase.query({ text: `DROP DATABASE ${testDatabaseName};` });
		await clientWithoutDatabase.end();
	}

	return { database, cleanupHook };
}