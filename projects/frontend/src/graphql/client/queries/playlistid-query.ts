import gql from "graphql-tag"
import { useQuery } from "@apollo/client"

export interface IPlaylistIDData {
	playlistID: string | null
}

export const GET_PLAYLIST_ID = gql`
	query {
		playlistID @client
	}
`

export const usePlaylistID = () => {
	const { data } = useQuery<IPlaylistIDData, {}>(GET_PLAYLIST_ID)

	return data ? data.playlistID : null
}
