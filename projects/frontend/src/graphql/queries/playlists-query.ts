import { IPlaylist } from "../types";
import gql from "graphql-tag";
import { Query, QueryResult } from "react-apollo";
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

export const GET_PLAYLISTS = gql`
	query getSharePlaylists($shareID: String!){
		share(shareID: $shareID) {
			id,
			playlists{
				${playlistKeys}
			}
		}
	}
`;

export class PlaylistsQuery extends Query<IGetPlaylistsData, IGetPlaylistsVariables>{ }

export const usePlaylists = (vars: IGetPlaylistsVariables) =>
	useQuery<IGetPlaylistsData, IGetPlaylistsVariables>(GET_PLAYLISTS, { variables: vars });