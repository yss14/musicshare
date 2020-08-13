import gql from "graphql-tag"
import {
	playlistKeys,
	IGetPlaylistsData,
	IGetPlaylistsVariables,
	GET_SHARE_PLAYLISTS,
} from "../queries/playlists-query"
import { useMutation, MutationHookOptions, MutationResult, MutationUpdaterFn } from "@apollo/client"
import { IPlaylist } from "../types"
import { useCallback } from "react"
import { IGetMergedPlaylistData, GET_MERGED_PLAYLISTS } from "../queries/merged-playlists-query"

export interface ICreatePlaylistVariables {
	shareID: string
	name: string
}

export interface ICreatePlaylistData {
	createPlaylist: IPlaylist
}

export const CREATE_PLAYLIST = gql`
	mutation CreatePlaylist($shareID: String!, $name: String!){
		createPlaylist(shareID: $shareID, name: $name){
			${playlistKeys}
		}
	}
`

export const useCreatePlaylist = (opts?: MutationHookOptions<ICreatePlaylistData, ICreatePlaylistVariables>) => {
	const makeUpdatePlaylistCache = useCallback(
		(shareID: string, isMergedView: boolean): MutationUpdaterFn<ICreatePlaylistData> => (cache, { data }) => {
			if (!isMergedView) {
				const sharePlaylistsQuery = cache.readQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
					query: GET_SHARE_PLAYLISTS,
					variables: { shareID },
				})

				if (sharePlaylistsQuery && data) {
					const sharePlaylists = sharePlaylistsQuery.share.playlists

					cache.writeQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
						query: GET_SHARE_PLAYLISTS,
						data: {
							share: {
								id: shareID,
								__typename: "Share",
								playlists: sharePlaylists.concat([data.createPlaylist]),
							},
						},
						variables: { shareID },
					})
				}
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
									share.id === data?.createPlaylist.shareID
										? {
												...share,
												playlists: share.playlists.concat(data.createPlaylist),
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

	const [createPlaylistMutation, other] = useMutation(CREATE_PLAYLIST, opts)

	const createPlaylist = useCallback(
		(shareID: string, name: string, isMergedView: boolean) => {
			createPlaylistMutation({
				variables: {
					shareID,
					name,
				},
				update: makeUpdatePlaylistCache(shareID, isMergedView),
			})
		},
		[createPlaylistMutation, makeUpdatePlaylistCache],
	)

	return [createPlaylist, other] as [
		(shareID: string, name: string, isMergedView: boolean) => void,
		MutationResult<ICreatePlaylistData>,
	]
}
