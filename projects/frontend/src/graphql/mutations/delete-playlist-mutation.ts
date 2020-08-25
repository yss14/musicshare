import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { queryCache } from "react-query"
import { getQueryKey, GET_SHARE_PLAYLISTS, GET_MERGED_PLAYLISTS } from "@musicshare/graphql-client"

interface IDeletePlaylistData {
	deletePlaylist: boolean
}

interface IDeletePlaylistVariables {
	playlistID: string
	shareID: string
}

const DELETE_PLAYLIST = gql`
	mutation DeletePlaylist($shareID: String!, $playlistID: String!) {
		deletePlaylist(shareID: $shareID, playlistID: $playlistID)
	}
`

export const useDeletePlaylist = (opts?: MutationHookOptions<IDeletePlaylistData, IDeletePlaylistVariables>) => {
	const [deletePlaylistMutation, other] = useMutation<IDeletePlaylistData, IDeletePlaylistVariables>(
		DELETE_PLAYLIST,
		opts,
	)

	const makeUpdateCache = useCallback(
		(shareID: string, playlistID: string, isMergedView: boolean): MutationUpdaterFn<IDeletePlaylistData> => (
			cache,
		) => {
			if (!isMergedView) {
				queryCache.invalidateQueries(getQueryKey(GET_SHARE_PLAYLISTS))
			} else {
				queryCache.invalidateQueries(getQueryKey(GET_MERGED_PLAYLISTS))
			}
		},
		[],
	)

	const deletePlaylist = useCallback(
		(shareID: string, playlistID: string, isMergedView: boolean) => {
			deletePlaylistMutation({
				variables: {
					shareID,
					playlistID,
				},
				update: makeUpdateCache(shareID, playlistID, isMergedView),
			})
		},
		[deletePlaylistMutation, makeUpdateCache],
	)

	return [deletePlaylist, other] as [
		(shareID: string, playlistID: string, isMergedView: boolean) => void,
		MutationResult<IDeletePlaylistData>,
	]
}
