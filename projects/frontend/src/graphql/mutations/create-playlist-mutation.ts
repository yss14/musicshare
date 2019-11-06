import gql from "graphql-tag";
import { playlistKeys, IGetPlaylistsData, IGetPlaylistsVariables, GET_SHARE_PLAYLISTS } from "../queries/playlists-query";
import { useMutation } from "@apollo/react-hooks";
import { MutationUpdaterFn } from "apollo-client/core/watchQueryOptions";
import { IPlaylist } from "../types";
import { useCallback } from "react";

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
	const updatePlaylistCache = useCallback<MutationUpdaterFn<ICreatePlaylistData>>((cache, { data }) => {
		const currentPlaylists = cache.readQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
			query: GET_SHARE_PLAYLISTS,
			variables: { shareID }
		})!.share.playlists;

		cache.writeQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
			query: GET_SHARE_PLAYLISTS,
			data: { share: { id: shareID, __typename: 'Share', playlists: currentPlaylists.concat([data!.createPlaylist]) } },
			variables: { shareID },
		});
	}, [shareID]);

	const hook = useMutation(CREATE_PLAYLIST, {
		variables: { shareID, name },
		update: updatePlaylistCache,
	});

	return hook;
}
