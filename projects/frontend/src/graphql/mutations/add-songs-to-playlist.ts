import { IPlaylistSong, playlistSongKeys } from "../types";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

export interface IAddSongsToPlaylistVariables {
	shareID: string;
	playlistID: string;
	songIDs: string[];
}

export interface IAddSongsToPlaylistData {
	addSongsToPlaylist: IPlaylistSong[];
}

export const ADD_SONGS_TO_PLAYLIST = gql`
	mutation AddSongsToPlaylist($shareID: String!, $playlistID: String!, $songIDs: [String!]!){
		addSongsToPlaylist(shareID: $shareID, playlistID: $playlistID, songIDs: $songIDs){
			${playlistSongKeys}
		}
	}
`;

export const useAddSongsToPlaylist = () =>
	useMutation<IAddSongsToPlaylistData, IAddSongsToPlaylistVariables>(ADD_SONGS_TO_PLAYLIST)
