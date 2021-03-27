import { Artist } from "../models/ArtistModel"
import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { ArtistDBResult } from "../database/tables"

const selectAllAccessibleArtistsOfUserQuery = (database: IDatabaseClient, userID: string) =>
	database.query(
		SQL.raw<ArtistDBResult>(
			`
				SELECT DISTINCT unnest(artists || remixer || featurings) as name
				FROM user_songs_view
				WHERE user_id_ref = $1
				ORDER BY name;
	`,
			[userID],
		),
	)

export type IArtistService = ReturnType<typeof ArtistService>

export const ArtistService = (database: IDatabaseClient) => {
	const getAllAccessibleArtistsOfUser = async (userID: string): Promise<Artist[]> => {
		const artistsResults = await selectAllAccessibleArtistsOfUserQuery(database, userID)

		return artistsResults.map((result) => Artist.fromString(result.name))
	}

	return {
		getAllAccessibleArtistsOfUser,
	}
}
