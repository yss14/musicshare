import gql from "graphql-tag";
import { playlistKeys, IGetPlaylistsData, IGetPlaylistsVariables, GET_PLAYLISTS } from "../queries/playlists-query";
import { useMutation } from "@apollo/react-hooks";
import { QueryResult, MutationUpdaterFn } from "react-apollo";
import { IPlaylist } from "../types";

export interface ICreatePlaylistVariables {
	shareID: string;
	name: string;
}

export interface ICreatePlaylistData {
	createPlaylist: IPlaylist;
}

export const CREATE_PLAYLIST = gql`
	mutation CreatePlaylist($shareID: String!, $name: String!){
		createPlaylist(shareID: $shareID, name: $name){
			${playlistKeys}
		}
	}
`;

interface ICreatePlaylistHook {
	shareID: string;
	name: string;
}

export const useCreatePlaylist = ({ shareID, name }: ICreatePlaylistHook) => {
	const updatePlaylistCache: MutationUpdaterFn<ICreatePlaylistData> = (cache, { data }) => {
		const currentPlaylists = cache.readQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
			query: GET_PLAYLISTS,
			variables: { shareID }
		})!.share.playlists;

		cache.writeQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
			query: GET_PLAYLISTS,
			data: { share: { id: shareID, __typename: 'Share', playlists: currentPlaylists.concat([data!.createPlaylist]) } },
			variables: { shareID },
		});
	}

	const hook = useMutation(CREATE_PLAYLIST, {
		variables: { shareID, name },
		update: updatePlaylistCache,
	});

	return hook;
}
