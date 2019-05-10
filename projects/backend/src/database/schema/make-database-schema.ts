import { DatabaseSeed } from "../seed";
import { UsersTable, SharesByUserTable, SongsByShareTable, SongTypesByShareTable, GenresByShareTable, UserLoginCredentialsTable, PlaylistsByShareTable, SongsByPlaylistTable, TokensByShareTable } from "./tables";
import { IDatabaseClient, CQL } from "cassandra-schema-builder";
import { Tables } from "./system-tables";

export const makeDatabaseSchemaWithSeed = async (database: IDatabaseClient, seed: DatabaseSeed, opts: ICreateSchemaOpts) => {
	await makeDatabaseSchema(database, opts);
	await seed();
}

interface ICreateSchemaOpts {
	keySpace: string;
	clear?: boolean;
}

export const makeDatabaseSchema = async (database: IDatabaseClient, { keySpace, clear = false }: ICreateSchemaOpts) => {
	if (clear) {
		await clearKeySpace(database, keySpace);
	}

	await Promise.all([
		database.execute(UsersTable.create().cql),
		database.execute(SharesByUserTable.create().cql),
		database.execute(SongsByShareTable.create().cql),
		database.execute(SongTypesByShareTable.create().cql),
		database.execute(GenresByShareTable.create().cql),
		database.execute(UserLoginCredentialsTable.create().cql),
		database.execute(PlaylistsByShareTable.create().cql),
		database.execute(SongsByPlaylistTable.create().cql),
		database.execute(TokensByShareTable.create().cql),
	]);
}

export const clearKeySpace = async (database: IDatabaseClient, keySpace: string): Promise<void> => {
	const schemaTables = await database.query(Tables.select('*', ['keyspace_name'])([keySpace]));

	for (const schemaTable of schemaTables) {
		await database.query({ cql: CQL.dropTable(schemaTable.table_name) });
	}
}