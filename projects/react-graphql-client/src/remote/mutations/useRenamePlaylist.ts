import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	useGraphQLMutation,
	IGraphQLMutationOpts,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_SHARE_PLAYLISTS } from "../queries/useSharePlaylists"
import { GET_MERGED_PLAYLISTS } from "../queries/useMergedPlaylists"

export interface IRenamePlaylistData {
	renamePlaylist: boolean
}

export interface IRenamePlaylistVariables {
	newName: string
	shareID: string
	playlistID: string
}

export const RENAME_PLAYLIST_MUTATION = TransformedGraphQLMutation<IRenamePlaylistData, IRenamePlaylistVariables>(gql`
	mutation renamePlaylist($newName: String!, $playlistID: String!, $shareID: String!) {
		renamePlaylist(newName: $newName, playlistID: $playlistID, shareID: $shareID)
	}
`)((data) => data.renamePlaylist)

export const useRenamePlaylist = (opts?: IGraphQLMutationOpts<typeof RENAME_PLAYLIST_MUTATION>) => {
	const mutation = useGraphQLMutation(RENAME_PLAYLIST_MUTATION, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.invalidateTypedQuery({
				query: GET_SHARE_PLAYLISTS,
				variables: { shareID: variables.shareID },
			})
			typedQueryCache.invalidateTypedQuery({
				query: GET_MERGED_PLAYLISTS,
			})

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
