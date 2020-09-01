import gql from "graphql-tag"
import { GET_SHARE_PLAYLISTS, GET_MERGED_PLAYLISTS, getQueryKey } from "@musicshare/graphql-client"
import { useMutation, MutationHookOptions, MutationResult, MutationUpdaterFn } from "@apollo/client"
import { IPlaylist } from "../types"
import { useCallback } from "react"
import { playlistKeys } from "@musicshare/shared-types"
import { queryCache } from "react-query"

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
				queryCache.invalidateQueries(getQueryKey(GET_SHARE_PLAYLISTS.query))
			} else {
				queryCache.invalidateQueries(getQueryKey(GET_MERGED_PLAYLISTS.query))
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
