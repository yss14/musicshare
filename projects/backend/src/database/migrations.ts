import { IMigration } from "postgres-schema-builder"

export const migrations = new Map<number, IMigration>()

/*
	add migrations here in the future like

	migrations.set(2, Migration(async (transaction) => {
		// do your migration here
	}))

	migrations.set(3, Migration(async (transaction) => {
		// do your migration here
	}))

	...

	Docs on how migrations work can be found here:
	https://github.com/yss14/postgres-schema-builder
*/
