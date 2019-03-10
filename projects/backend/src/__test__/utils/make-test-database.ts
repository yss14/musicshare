import { CustomEnv } from "../../utils/env/CustomEnv";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { v4 as uuid } from 'uuid';
import { SongService } from "../../services/SongService";
import { makeDatabaseSeed } from "../../database/seed";
import { makeDatabaseSchemaWithSeed } from "../../database/schema/make-database-schema";

export const makeTestDatabase = async () => {
	const databaseHost = process.env[CustomEnv.CASSANDRA_HOST] || '127.0.0.1';
	const databaseKeyspace = 'test_' + uuid().split('-').join('');
	const databaseWithoutScope = new DatabaseConnection({
		contactPoints: [databaseHost]
	});

	await databaseWithoutScope.execute(`
		CREATE KEYSPACE ${databaseKeyspace}
			WITH REPLICATION = { 
				'class' : 'SimpleStrategy', 
				'replication_factor' : 1 
			};
	`);

	const database = new DatabaseConnection({
		contactPoints: [databaseHost],
		keyspace: databaseKeyspace
	});

	const seed = async (songService: SongService) => {
		const seed = await makeDatabaseSeed(database, songService);
		await makeDatabaseSchemaWithSeed(database, seed, { keySpace: databaseKeyspace, clear: true });
	}

	const cleanUp = async () => {
		try {
			await database.close();

			await databaseWithoutScope.execute(`DROP KEYSPACE IF EXISTS ${databaseKeyspace}`);

			await databaseWithoutScope.close();
		} catch (err) {
			console.error(err);
		}
	}

	return { database, seed, cleanUp, databaseKeyspace };
}