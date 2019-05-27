import { IConfig } from "../types/config";
import { IDatabaseClient, DatabaseClient, Query, CQL } from "postgres-schema-builder";
import { auth, Client } from "cassandra-driver";

export const connectAndSetupDatabase = async (config: IConfig): Promise<IDatabaseClient> => {
	let authProvider: auth.AuthProvider | null = null;

	if (config.database.password && config.database.user) {
		authProvider = new auth.PlainTextAuthProvider(config.database.user, config.database.password);
	}

	const databaseWithoutKeyspace = new DatabaseClient(
		new Client({
			contactPoints: [config.database.host],
			localDataCenter: 'datacenter1',
			authProvider: authProvider || undefined
		})
	);

	await databaseWithoutKeyspace.query(Query(CQL.createKeyspace(config.database.keyspace)));
	await databaseWithoutKeyspace.close();

	const database = new DatabaseClient(
		new Client({
			contactPoints: [config.database.host],
			localDataCenter: 'datacenter1',
			keyspace: config.database.keyspace,
			authProvider: authProvider || undefined
		})
	);

	return database;
}