import gql from "graphql-tag"
import { MutationHookOptions, useMutation, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { queryCache } from "react-query"
import { getQueryKey, GET_SHARE_PLAYLISTS, GET_MERGED_PLAYLISTS } from "@musicshare/graphql-client"

interface IRenamePlaylistData {
	renamePlaylist: boolean
}

interface IRenamePlaylistVariables {
	newName: string
	shareID: string
	playlistID: string
}

const RENAME_PLAYLIST_MUTATION = gql`
	mutation RenamePlaylist($newName: String!, $playlistID: String!, $shareID: String!) {
		renamePlaylist(newName: $newName, playlistID: $playlistID, shareID: $shareID)
	}
`

export const useRenamePlaylist = (opts?: MutationHookOptions<IRenamePlaylistData, IRenamePlaylistVariables>) => {
	const makeUpdatePlaylistCache = useCallback(
		(
			newName: string,
			shareID: string,
			playlistID: string,
			isMergedView: boolean,
		): MutationUpdaterFn<IRenamePlaylistData> => (cache) => {
			if (!isMergedView) {
				queryCache.invalidateQueries(getQueryKey(GET_SHARE_PLAYLISTS))
			} else {
				queryCache.invalidateQueries(getQueryKey(GET_MERGED_PLAYLISTS))
			}
		},
		[],
	)

	const [renamePlaylistMutation, other] = useMutation<IRenamePlaylistData, IRenamePlaylistVariables>(
		RENAME_PLAYLIST_MUTATION,
		opts,
	)

	const renamePlaylist = useCallback(
		(newName: string, shareID: string, playlistID: string, isMergedView: boolean) => {
			renamePlaylistMutation({
				variables: { newName, playlistID, shareID },
				update: makeUpdatePlaylistCache(newName, shareID, playlistID, isMergedView),
			})
		},
		[renamePlaylistMutation, makeUpdatePlaylistCache],
	)

	return [renamePlaylist, other] as const
}
