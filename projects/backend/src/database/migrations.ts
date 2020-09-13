import { IMigration, Migration, SQL, ColumnType } from "postgres-schema-builder"
import { DatabaseV2 } from "./versions/SchemaV2"

/*
	Docs on how migrations work can be found here:
	https://github.com/yss14/postgres-schema-builder
*/

export const Migrations = () => {
	const migrations = new Map<number, IMigration>()

	migrations.set(
		2,
		Migration(async ({ transaction }) => {
			await transaction.query(
				SQL.raw(SQL.addColumns("song_types", { song_type_id: { type: ColumnType.UUID, nullable: true } })),
			)
			await transaction.query(SQL.raw(SQL.addColumns("genres", { genre_id: DatabaseV2.genres.genre_id })))

			await transaction.query(
				SQL.raw(`
				UPDATE genres SET genre_id = uuid_generate_v4();
				UPDATE song_types SET song_type_id = uuid_generate_v4();
			`),
			)

			await transaction.query(
				SQL.raw(`
				CREATE UNIQUE INDEX genres_genre_id_uindex
					ON genres (genre_id);
				ALTER TABLE genres DROP CONSTRAINT pk_genres_name_group_share_id_ref;
				ALTER TABLE genres
					ADD CONSTRAINT genres_pk
						PRIMARY KEY (genre_id);
				ALTER TABLE genres
					ADD CONSTRAINT pk_genres_name_group_share_id_ref
						UNIQUE (name, "group", share_id_ref);
			`),
			)
			await transaction.query(
				SQL.raw(`
				CREATE UNIQUE INDEX song_types_song_type_id_uindex
					ON song_types (song_type_id);
				ALTER TABLE song_types DROP CONSTRAINT pk_song_types_name_group_share_id_ref;
				ALTER TABLE song_types
					ADD CONSTRAINT song_types_pk
						PRIMARY KEY (song_type_id);
				ALTER TABLE song_types
					ADD CONSTRAINT pk_song_types_name_group_share_id_ref
						UNIQUE (name, "group", share_id_ref);
			`),
			)
		}),
	)

	return migrations
}
