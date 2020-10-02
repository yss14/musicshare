import { IMigration, Migration, SQL, ColumnType, SchemaDiff, IQuery, Table } from "postgres-schema-builder"
import { defaultShareQuota } from "./fixtures"
import { DatabaseV2 } from "./versions/SchemaV2"
import { DatabaseV3 } from "./versions/SchemaV3"
import { DatabaseV4 } from "./versions/SchemaV4"

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

	migrations.set(
		3,
		Migration(async ({ transaction }) => {
			await transaction.query(SQL.raw(SQL.createTable("captchas", DatabaseV3.captchas)))
			await transaction.query(SQL.raw(SQL.createIndex(true, "users", "email")))
		}),
	)

	migrations.set(
		4,
		Migration(async ({ database }) => {
			const updates: IQuery<{}>[] = []
			const diffs = SchemaDiff(DatabaseV3, DatabaseV4)

			updates.push(
				SQL.raw(
					diffs.addRequiredColumn("shares", "quota", [
						`UPDATE shares SET quota = ${defaultShareQuota} WHERE is_library = True;`,
						`UPDATE shares SET quota = 0 WHERE is_library = False;`,
					]),
				),
			)
			updates.push(SQL.raw(diffs.addTableColumn("shares", "quota_used")))

			const SongsTableV4 = Table(DatabaseV4, "songs")
			const songs = await database.query(SongsTableV4.selectAll("*"))
			songs.forEach((song) =>
				updates.push(
					SongsTableV4.update(["sources"], ["song_id"])(
						[
							{
								data: song.sources.data.map((source) => ({ ...source, fileSize: 0 })),
							},
						],
						[song.song_id],
					),
				),
			)

			return updates
		}),
	)

	return migrations
}
