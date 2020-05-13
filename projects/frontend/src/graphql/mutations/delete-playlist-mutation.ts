import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions } from "react-apollo"
import { useCallback } from "react"
import { MutationUpdaterFn } from "apollo-client"
import { IGetPlaylistsData, IGetPlaylistsVariables, GET_SHARE_PLAYLISTS } from "../queries/playlists-query"
import { IGetMergedPlaylistData, GET_MERGED_PLAYLISTS } from "../queries/merged-playlists-query"

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
			} else {
				const mergedPlaylistsQuery = cache.readQuery<IGetMergedPlaylistData, void>({
					query: GET_MERGED_PLAYLISTS,
				})

				if (mergedPlaylistsQuery) {
					cache.writeQuery<IGetMergedPlaylistData, void>({
						query: GET_MERGED_PLAYLISTS,
						data: {
							...mergedPlaylistsQuery,
							viewer: {
								...mergedPlaylistsQuery.viewer,
								shares: mergedPlaylistsQuery.viewer.shares.map((share) =>
									share.id === shareID
										? {
												...share,
												playlists: share.playlists.filter(
													(playlist) => playlist.id !== playlistID,
												),
										  }
										: share,
								),
							},
						},
					})
				}
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
