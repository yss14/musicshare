import ApolloClient from "apollo-client";
import { GET_SONG_MEDIAURL, ISongMediaURLData, ISongMediaURLVariables } from "../queries/song-mediaurl-query";

export const getSongMediaURL = (client: ApolloClient<unknown>) => async (shareID: string, songID: string): Promise<string> => {
	const response = await client.query<ISongMediaURLData, ISongMediaURLVariables>({
		query: GET_SONG_MEDIAURL,
		variables: {
			shareID,
			songID
		},
		fetchPolicy: "no-cache",
	});

	if (!response.errors) {
		return response.data.share.song.accessUrl;
	}

	throw `Cannot fetch media url for song ${songID}`;
}