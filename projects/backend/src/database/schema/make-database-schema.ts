import { DatabaseSeed } from "../seed";
import { CoreTables } from "./tables";
import { IDatabaseClient, composeCreateTableStatements, sortTableDependencies, SQL } from "postgres-schema-builder";

export const makeDatabaseSchemaWithSeed = async (database: IDatabaseClient, seed: DatabaseSeed, opts: ICreateSchemaOpts) => {
	await makeDatabaseSchema(database, opts);
	await seed();
}

interface ICreateSchemaOpts {
	databaseUser: string;
	clear?: boolean;
}

export const makeDatabaseSchema = async (database: IDatabaseClient, { databaseUser, clear = false }: ICreateSchemaOpts) => {
	if (clear) {
		await clearDatabase(database, databaseUser);
	}

	const createTableStatements = composeCreateTableStatements(CoreTables);

	for (const createTableStatement of createTableStatements) {
		await database.query({ sql: createTableStatement }); // TODO transaction
	}
}

export const clearTables = async (database: IDatabaseClient) => {
	const tablesInOrder = sortTableDependencies(CoreTables).reverse();

	for (const [tableName] of tablesInOrder) {
		await database.query(SQL.raw<{}>(`DELETE FROM ${tableName};`));
	}
}

export const clearDatabase = async (database: IDatabaseClient, databaseUser: string) => {
	await database.query({
		sql: `DROP SCHEMA public CASCADE;`
			+ `CREATE SCHEMA public;`
			+ `GRANT ALL ON SCHEMA public TO ${databaseUser};`
			+ `GRANT ALL ON SCHEMA public TO public;`
			+ `COMMENT ON SCHEMA public IS 'standard public schema';`
	});
};