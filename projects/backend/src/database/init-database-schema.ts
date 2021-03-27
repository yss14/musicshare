import {
	composeCreateTableStatements,
	DatabaseSchema,
	IDatabaseClient,
	sortViewDependencies,
	SQL,
} from "postgres-schema-builder"
import { Migrations } from "./migrations"
import { Tables } from "./tables"
import { ShareSongsView, UserSongsView } from "./views"

export const initDatabaseSchema = async (database: IDatabaseClient) => {
	await database.query(SQL.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`))

	const migrations = Migrations()

	const viewDependencies = sortViewDependencies([ShareSongsView, UserSongsView])
	const createViewsCommands = viewDependencies.map((view) => view.create())
	const dropViewsCommands = viewDependencies.reverse().map((view) => view.drop())

	const schema = DatabaseSchema({
		client: database,
		name: "MusicShare",
		createStatements: composeCreateTableStatements(Tables),
		viewCommands: {
			create: createViewsCommands,
			drop: dropViewsCommands,
		},
		migrations,
	})

	await schema.init()
	await schema.migrateLatest()

	return schema
}
