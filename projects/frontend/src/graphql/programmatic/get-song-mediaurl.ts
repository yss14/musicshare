import ApolloClient from "apollo-client"
import {
	GET_SONG_MEDIAURL,
	ISongMediaURLData,
	ISongMediaURLVariables,
	ISongMediaUrl,
} from "../queries/song-mediaurl-query"

export const makeGetSongMediaUrls = (client: ApolloClient<unknown>) => async (
	shareID: string,
	songID: string,
): Promise<ISongMediaUrl[]> => {
	const response = await client.query<ISongMediaURLData, ISongMediaURLVariables>({
		query: GET_SONG_MEDIAURL,
		variables: {
			shareID,
			songID,
		},
		fetchPolicy: "no-cache",
	})

	if (!response.errors) {
		return response.data.share.song.sources
	}

	throw new Error(`Cannot fetch media url for song ${songID}`)
}
