import { useApolloClient } from "@apollo/client"
import { IPlaylistIDData, GET_PLAYLIST_ID } from "../queries/playlistid-query"

export const useUpdateplaylistID = () => {
	const client = useApolloClient()

	return (playlistID: string | null) => {
		client.writeQuery<IPlaylistIDData, {}>({
			query: GET_PLAYLIST_ID,
			data: {
				playlistID,
			},
		})
	}
}
