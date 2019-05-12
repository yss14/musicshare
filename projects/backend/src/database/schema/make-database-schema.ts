import { DatabaseSeed } from "../seed";
import { /*UsersTable, SharesByUserTable, SongsByShareTable, SongTypesByShareTable, GenresByShareTable, UserLoginCredentialsTable, PlaylistsByShareTable, SongsByPlaylistTable, TokensByShareTable,*/ CoreTables } from "./tables";
import { IDatabaseClient, CQL, Table } from "cassandra-schema-builder";
import { Tables } from "./system-tables";

export const makeDatabaseSchemaWithSeed = async (database: IDatabaseClient, seed: DatabaseSeed, opts: ICreateSchemaOpts) => {
	const startTimeCreate = Date.now();
	await makeDatabaseSchema(database, opts);
	console.log(`Create ${Date.now() - startTimeCreate}ms`);
	const startTimeSeed = Date.now();
	await seed();
	console.log(`Seed ${Date.now() - startTimeSeed}ms`);
}

interface ICreateSchemaOpts {
	keySpace: string;
	clear?: boolean;
}

const keys = <O>(o: O) => {
	return Object.keys(o) as (keyof O)[];
}

export const makeDatabaseSchema = async (database: IDatabaseClient, { keySpace, clear = false }: ICreateSchemaOpts) => {
	if (clear) {
		await clearKeySpace(database, keySpace);
	}

	const allTables = keys(CoreTables).map(name => Table(CoreTables, name));

	await Promise.all(allTables.map(table => database.query(table.create())));
}

export const clearKeySpace = async (database: IDatabaseClient, keySpace: string): Promise<void> => {
	const schemaTables = await database.query(Tables.select('*', ['keyspace_name'])([keySpace]));

	for (const schemaTable of schemaTables) {
		await database.query({ cql: CQL.dropTable(schemaTable.table_name) });
	}
}