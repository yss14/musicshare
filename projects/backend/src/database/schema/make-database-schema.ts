import { DatabaseSeed } from "../seed";
import { /*UsersTable, SharesByUserTable, SongsByShareTable, SongTypesByShareTable, GenresByShareTable, UserLoginCredentialsTable, PlaylistsByShareTable, SongsByPlaylistTable, TokensByShareTable,*/ CoreTables } from "./tables";
import { IDatabaseClient, CQL, Table } from "cassandra-schema-builder";
import { Tables } from "./system-tables";

export const makeDatabaseSchemaWithSeed = async (database: IDatabaseClient, seed: DatabaseSeed, opts: ICreateSchemaOpts) => {
	await makeDatabaseSchema(database, opts);
	await seed();
}

interface ICreateSchemaOpts {
	keySpace: string;
	clear?: boolean;
}

const keys = <O>(o: O) => {
	return Object.keys(o) as (keyof O)[];
}

const getAllTables = () => keys(CoreTables).map(name => Table(CoreTables, name));

export const makeDatabaseSchema = async (database: IDatabaseClient, { keySpace, clear = false }: ICreateSchemaOpts) => {
	if (clear) {
		await clearKeySpace(database, keySpace);
	}

	await Promise.all(getAllTables().map(table => database.query(table.create())));
}

export const clearTables = async (database: IDatabaseClient) => {
	const allTables = getAllTables();

	const truncateQueries = allTables.map(table => database.execute(`TRUNCATE TABLE ${table.name};`));

	await Promise.all(truncateQueries);
}

export const clearKeySpace = async (database: IDatabaseClient, keySpace: string): Promise<void> => {
	const schemaTables = await database.query(Tables.select('*', ['keyspace_name'])([keySpace]));

	for (const schemaTable of schemaTables) {
		await database.query({ cql: CQL.dropTable(schemaTable.table_name) });
	}
}