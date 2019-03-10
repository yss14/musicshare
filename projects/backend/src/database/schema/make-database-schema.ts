import { DatabaseConnection } from "../DatabaseConnection";
import { songsByShare, users, sharesByUser } from "./initial-schema";
import { DatabaseSeed } from "../seed";

interface ISystemSchemaDBResult {
	keyspace_name: string;
	table_name: string;
}

export const makeDatabaseSchemaWithSeed = async (databaseConnection: DatabaseConnection, seed: DatabaseSeed, opts: ICreateSchemaOpts) => {
	await makeDatabaseSchema(databaseConnection, opts);
	await seed();
}

interface ICreateSchemaOpts {
	keySpace: string;
	clear?: boolean;
}

export const makeDatabaseSchema = async (dbConn: DatabaseConnection, { keySpace, clear = false }: ICreateSchemaOpts) => {
	if (clear) {
		await clearKeySpace(dbConn, keySpace);
	}

	await Promise.all([
		dbConn.execute(users()),
		dbConn.execute(sharesByUser()),
		dbConn.execute(songsByShare())
	]);
}

export const clearKeySpace = async (databaseConnection: DatabaseConnection, keySpace: string): Promise<void> => {
	const schemaTables = await getSchemaTables(databaseConnection, keySpace);

	for (const schemaTable of schemaTables) {
		await dropTable(databaseConnection, schemaTable);
	}
}

export const getSchemaTables = async (databaseConnection: DatabaseConnection, keySpace: string) => {
	const dbResults = await databaseConnection.select<ISystemSchemaDBResult>(`
		SELECT * FROM system_schema.tables WHERE keyspace_name = ?;
	`, [keySpace]);

	return dbResults.map(row => row.table_name);
}

export const dropTable = async (databaseConnection: DatabaseConnection, table: string) => {
	await databaseConnection.execute(`
		DROP TABLE ${table};
	`);
}