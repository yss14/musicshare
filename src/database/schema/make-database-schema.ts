import { DatabaseConnection } from "../DatabaseConnection";
import { songsByShare, users, sharesByUser } from "./initial-schema";
import { DatabaseSeed } from "../seed";

interface ISystemSchemaDBResult {
	keyspace_name: string;
	table_name: string;
}

interface ICreateSchemaOpts {
	keySpace: string;
	clear?: boolean;
}

export const makeDatabaseSchemaWithSeed = async (databaseConnection: DatabaseConnection, seed: DatabaseSeed, opts: ICreateSchemaOpts) => {
	await makeDatabaseSchema(databaseConnection, opts);
	await seed();
}

export const makeDatabaseSchema = async (databaseConnection: DatabaseConnection, opts: ICreateSchemaOpts) => {
	const shouldClearKeySpace = opts && opts.clear || false;

	if (shouldClearKeySpace) {
		await clearKeySpace(databaseConnection, opts.keySpace);
	}

	await Promise.all([
		databaseConnection.execute(users()),
		databaseConnection.execute(sharesByUser()),
		databaseConnection.execute(songsByShare())
	]);
}

const clearKeySpace = async (databaseConnection: DatabaseConnection, keySpace: string): Promise<void> => {
	const schemaTables = await getSchemaTables(databaseConnection, keySpace);

	for (const schemaTable of schemaTables) {
		await dropTable(databaseConnection, schemaTable);
	}
}

const getSchemaTables = async (databaseConnection: DatabaseConnection, keySpace: string) => {
	const dbResults = await databaseConnection.select<ISystemSchemaDBResult>(`
		SELECT * FROM system_schema.tables WHERE keyspace_name = ?;
	`, [keySpace]);

	return dbResults.map(row => row.table_name);
}

const dropTable = async (databaseConnection: DatabaseConnection, table: string) => {
	await databaseConnection.execute(`
		DROP TABLE ${table};
	`);
}