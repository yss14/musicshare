import { IPlaylist } from "../types";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IGetPlaylistsData {
	share: {
		id: string;
		__typename: 'Share';
		playlists: IPlaylist[];
	}
}

export interface IGetPlaylistsVariables {
	shareID: string;
}

export const playlistKeys = `
	id
	name
	shareID
	dateAdded
`;

export const GET_SHARE_PLAYLISTS = gql`
	query getSharePlaylists($shareID: String!){
		share(shareID: $shareID) {
			id,
			playlists{
				${playlistKeys}
			}
		}
	}
`;

export const useSharePlaylists = (vars: IGetPlaylistsVariables) =>
	useQuery<IGetPlaylistsData, IGetPlaylistsVariables>(GET_SHARE_PLAYLISTS, { variables: vars });