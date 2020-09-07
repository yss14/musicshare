import { Artist } from "@musicshare/shared-types"
import { typedQueryCache } from "../react-query-graphql"
import { GET_ARTISTS } from "../remote/queries/useArtists"

export const addArtistsToCache = (artists: Artist[]) => {
	typedQueryCache.setTypedQueryData(
		{
			query: GET_ARTISTS,
		},
		(currentArtists) => {
			if (!currentArtists) return []

			const artistNamesSet = new Set(currentArtists.map((artist) => artist.name))
			const artistsToAdd = artists.filter((artist) => !artistNamesSet.has(artist.name))

			return [...currentArtists, ...artistsToAdd]
		},
	)
}
