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

	const postgresDatabaseResult = await databaseWithoutKeyspace.query<{}>(
		SQL.raw(`SELECT FROM pg_database WHERE datname = '${config.database.database}'`));

	if (postgresDatabaseResult.length === 0) {
		await databaseWithoutKeyspace.query(Query(SQL.createDatabase(config.database.database)));
	}

	await databaseWithoutKeyspace.close();

	const database = DatabaseClient(
		new Pool({
			host: config.database.host,
			port: config.database.port,
			user: config.database.user,
			password: config.database.password,
			database: config.database.database,
			max: 50,
		})
	);

	return database;
}