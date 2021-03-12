import { Artist } from "../models/ArtistModel"
import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { ArtistDBResult } from "../database/tables"
import { ServiceFactory } from "./services"

const selectArtistsOfSharesQuery = (database: IDatabaseClient, shareIDs: string[]) =>
	database.query(
		SQL.raw<ArtistDBResult>(
			`
		SELECT DISTINCT unnest(s.artists || s.remixer || s.featurings) as name
		FROM songs s
		INNER JOIN share_songs ss ON ss.song_id_ref = s.song_id
		INNER JOIN share_songs sls ON sls.song_id_ref = ss.song_id_ref
		INNER JOIN shares l ON l.share_id = sls.share_id_ref
		WHERE ss.share_id_ref = ANY($1)
			AND s.date_removed IS NULL
			AND ss.date_removed IS NULL
		ORDER BY name;
	`,
			[shareIDs],
		),
	)

export type IArtistService = ReturnType<typeof ArtistService>

export const ArtistService = (database: IDatabaseClient, services: ServiceFactory) => {
	const getArtistsForShare = async (shareID: string) => {
		const artistsResults = await selectArtistsOfSharesQuery(database, [shareID])

		return artistsResults.map((result) => Artist.fromString(result.name))
	}

	const getArtistsForShares = async (shareIDs: string[]) => {
		const artistsResults = await selectArtistsOfSharesQuery(database, shareIDs)

		return artistsResults.map((result) => Artist.fromString(result.name))
	}

	const getAggregatedArtistsForUser = async (userID: string): Promise<Artist[]> => {
		const linkedLibraries = await services().shareService.getLinkedLibrariesOfUser(userID)

		const artistsResults = await selectArtistsOfSharesQuery(
			database,
			linkedLibraries.map((library) => library.id),
		)

		return artistsResults.map((result) => Artist.fromString(result.name))
	}

	return {
		getArtistsForShare,
		getArtistsForShares,
		getAggregatedArtistsForUser,
	}
}
