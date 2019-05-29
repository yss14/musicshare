import { IConfig } from "../types/config";
import { IDatabaseClient, DatabaseClient, Query, SQL } from "postgres-schema-builder";
import { Pool } from "pg";

export const connectAndSetupDatabase = async (config: IConfig): Promise<IDatabaseClient> => {
	const databaseWithoutKeyspace = DatabaseClient(
		new Pool({
			host: config.database.host,
			port: config.database.port,
			user: config.database.user,
			password: config.database.password,
			max: 1,
		})
	);

	await databaseWithoutKeyspace.query(Query(SQL.createDatabase(config.database.keyspace)));
	await databaseWithoutKeyspace.close();

	const database = DatabaseClient(
		new Pool({
			host: config.database.host,
			port: config.database.port,
			user: config.database.user,
			password: config.database.password,
			database: config.database.keyspace,
			max: 50,
		})
	);

	return database;
}