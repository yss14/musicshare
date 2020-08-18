import { DataProxy } from "@apollo/client"
import { IArtist } from "../types"
import { IGetArtistsData, GET_ARTISTS } from "@musicshare/graphql-client"

export const addArtistsToCache = (cache: DataProxy, artists: IArtist[]) => {
	const currentArtists = cache.readQuery<IGetArtistsData, void>({
		query: GET_ARTISTS,
	})

	if (!currentArtists) return

	const artistNamesSet = new Set(currentArtists.viewer.artists.map((artist) => artist.name))
	const artistsToAdd = artists.filter((artist) => !artistNamesSet.has(artist.name))

	if (artistsToAdd.length > 0) {
		cache.writeQuery<IGetArtistsData, void>({
			query: GET_ARTISTS,
			data: {
				...currentArtists,
				viewer: {
					...currentArtists.viewer,
					artists: currentArtists.viewer.artists.concat(
						artistsToAdd.map((artist) => ({ ...artist, __typename: "Artist" })),
					),
				},
			},
		})
	}
}
