import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import { GET_SHARE_PLAYLISTS } from "../queries/useSharePlaylists"
import { GET_MERGED_PLAYLISTS } from "../queries/useMergedPlaylists"

export interface IDeletePlaylistData {
	deletePlaylist: boolean
}

export interface IDeletePlaylistVariables {
	playlistID: string
	shareID: string
}

export const DELETE_PLAYLIST = TransformedGraphQLMutation<IDeletePlaylistData, IDeletePlaylistVariables>(gql`
	mutation deletePlaylist($shareID: String!, $playlistID: String!) {
		deletePlaylist(shareID: $shareID, playlistID: $playlistID)
	}
`)((data) => data.deletePlaylist)

export const useDeletePlaylist = (opts?: IGraphQLMutationOpts<typeof DELETE_PLAYLIST>) => {
	const mutation = useGraphQLMutation(DELETE_PLAYLIST, {
		...opts,
		onSuccess: (data, variables, context) => {
			typedQueryClient.setTypedQueryData(
				{
					query: GET_SHARE_PLAYLISTS,
					variables: { shareID: variables.shareID },
				},
				(currentData) => currentData?.filter((playlist) => playlist.id !== variables.playlistID) || [],
			)
			typedQueryClient.setTypedQueryData(
				{
					query: GET_MERGED_PLAYLISTS,
				},
				(currentData) => currentData?.filter((playlist) => playlist.id !== variables.playlistID) || [],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables, context)
		},
	})

	return mutation
}
