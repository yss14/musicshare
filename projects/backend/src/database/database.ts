import { IConfig } from "../types/config";
import { IDatabaseClient, DatabaseClient, Query, SQL, DatabaseSchema, composeCreateTableStatements, sortTableDependencies } from "postgres-schema-builder";
import { Pool } from "pg";
import { Tables } from "./tables";
import { migrations } from './migrations'

export const clearDatabase = async (database: IDatabaseClient, databaseUser: string) => {
	await database.query({
		sql: `DROP SCHEMA public CASCADE;`
			+ `CREATE SCHEMA public;`
			+ `GRANT ALL ON SCHEMA public TO ${databaseUser};`
			+ `GRANT ALL ON SCHEMA public TO public;`
			+ `COMMENT ON SCHEMA public IS 'standard public schema';`
	})
}

export const clearTables = async (database: IDatabaseClient) => {
	const tablesInOrder = sortTableDependencies(Tables).reverse();

	for (const [tableName] of tablesInOrder) {
		await database.query(SQL.raw<{}>(`DELETE FROM ${tableName};`))
	}
}

export const connectAndSetupDatabase = async (config: IConfig) => {
	const clientWithoutDatabase = DatabaseClient(
		new Pool({
			host: config.database.host,
			port: config.database.port,
			user: config.database.user,
			password: config.database.password,
			max: 1,
		})
	);

	const postgresDatabaseResult = await clientWithoutDatabase.query<{}>(
		SQL.raw(`SELECT FROM pg_database WHERE datname = '${config.database.database}'`))

	if (postgresDatabaseResult.length === 0) {
		await clientWithoutDatabase.query(Query(SQL.createDatabase(config.database.database)))
	}

	await clientWithoutDatabase.close()

	const database = DatabaseClient(
		new Pool({
			host: config.database.host,
			port: config.database.port,
			user: config.database.user,
			password: config.database.password,
			database: config.database.database,
		})
	)

	if (config.database.clear === true) {
		console.info('Clear database')
		await clearDatabase(database, config.database.user)
	}

	const schema = DatabaseSchema({
		client: database,
		name: 'What2Work',
		createStatements: composeCreateTableStatements(Tables),
		migrations,
	})

	await schema.init()
	await schema.migrateLatest()

	return { database, schema }
}