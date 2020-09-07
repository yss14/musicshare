import gql from "graphql-tag"
import { playlistKeys, Playlist } from "@musicshare/shared-types"
import {
	TransformedGraphQLMutation,
	useGraphQLMutation,
	typedQueryCache,
	IGraphQLMutationOpts,
} from "../../react-query-graphql"
import { GET_SHARE_PLAYLISTS } from "../queries/useSharePlaylists"
import { GET_MERGED_PLAYLISTS } from "../queries/useMergedPlaylists"

export interface ICreatePlaylistVariables {
	shareID: string
	name: string
}

export interface ICreatePlaylistData {
	createPlaylist: Playlist
}

export const CREATE_PLAYLIST = TransformedGraphQLMutation<ICreatePlaylistData, ICreatePlaylistVariables>(gql`
	mutation createPlaylist($shareID: String!, $name: String!){
		createPlaylist(shareID: $shareID, name: $name){
			${playlistKeys}
		}
	}
`)((data) => data.createPlaylist)

export const useCreatePlaylist = (opts?: IGraphQLMutationOpts<typeof CREATE_PLAYLIST>) => {
	const mutation = useGraphQLMutation(CREATE_PLAYLIST, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_SHARE_PLAYLISTS,
					variables: { shareID: variables.shareID },
				},
				(currentData) => [...(currentData || []), data],
			)
			typedQueryCache.setTypedQueryData(
				{
					query: GET_MERGED_PLAYLISTS,
				},
				(currentData) => [...(currentData || []), data],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
