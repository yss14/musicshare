import {
	composeCreateTableStatements,
	DatabaseSchema,
	IDatabaseClient,
	sortViewDependencies,
	SQL,
} from "postgres-schema-builder"
import { Migrations } from "./migrations"
import { Tables } from "./tables"
import { Views } from "./views"

export const initDatabaseSchema = async (database: IDatabaseClient) => {
	await database.query(SQL.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`))

	const migrations = Migrations()

	const views = sortViewDependencies([Views.ShareSongsView, Views.UserSongsView, Views.ShareSongPlaysView])

	const schema = DatabaseSchema({
		client: database,
		name: "MusicShare",
		createStatements: composeCreateTableStatements(Tables),
		views,
		migrations,
	})

	await schema.init()
	await schema.migrateLatest()

	return schema
}
