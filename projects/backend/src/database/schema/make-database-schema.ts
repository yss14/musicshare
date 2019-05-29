import { DatabaseSeed } from "../seed";
import { CoreTables } from "./tables";
import { IDatabaseClient, composeCreateTableStatements } from "postgres-schema-builder";

export const makeDatabaseSchemaWithSeed = async (database: IDatabaseClient, seed: DatabaseSeed, opts: ICreateSchemaOpts) => {
	await makeDatabaseSchema(database, opts);
	await seed();
}

interface ICreateSchemaOpts {
	databaseUser: string;
	clear?: boolean;
}

/* const keys = <O>(o: O) => {
	return Object.keys(o) as (keyof O)[];
} */

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
	/*const allTables = getAllTables();

	const truncateQueries = allTables.map(table => database.execute(`TRUNCATE TABLE ${table.name};`));

	await Promise.all(truncateQueries);*/
	throw 'Not implemented yet';
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