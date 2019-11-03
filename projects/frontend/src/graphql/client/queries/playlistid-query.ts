import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IPlaylistIDData {
	playlistID: string;
}

export const GET_PLAYLIST_ID = gql`
  	query {
    	playlistID @client
  	}
`;

export const usePlaylistID = () => {
	const { data } = useQuery<IPlaylistIDData, {}>(GET_PLAYLIST_ID)

	return data ? data.playlistID : null
}
