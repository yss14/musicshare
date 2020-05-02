import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions } from "react-apollo"
import { useCallback } from "react"
import { MutationUpdaterFn } from "apollo-client"
import { IGetPlaylistsData, IGetPlaylistsVariables, GET_SHARE_PLAYLISTS } from "../queries/playlists-query"

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
		(shareID: string, playlistID: string): MutationUpdaterFn<IDeletePlaylistData> => (cache) => {
			const currentData = cache.readQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
				query: GET_SHARE_PLAYLISTS,
				variables: {
					shareID,
				},
			})

			if (!currentData) return

			cache.writeQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
				query: GET_SHARE_PLAYLISTS,
				variables: {
					shareID,
				},
				data: {
					...currentData,
					share: {
						...currentData.share,
						playlists: currentData.share.playlists.filter((playlist) => playlist.id !== playlistID),
					},
				},
			})
		},
		[],
	)

	const deletePlaylist = useCallback(
		(shareID: string, playlistID: string) => {
			deletePlaylistMutation({
				variables: {
					shareID,
					playlistID,
				},
				update: makeUpdateCache(shareID, playlistID),
			})
		},
		[deletePlaylistMutation, makeUpdateCache],
	)

	return [deletePlaylist, other] as [
		(shareID: string, playlistID: string) => void,
		MutationResult<IDeletePlaylistData>,
	]
}
