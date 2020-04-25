import gql from "graphql-tag"
import {
	playlistKeys,
	IGetPlaylistsData,
	IGetPlaylistsVariables,
	GET_SHARE_PLAYLISTS,
} from "../queries/playlists-query"
import { useMutation } from "@apollo/react-hooks"
import { MutationUpdaterFn } from "apollo-client/core/watchQueryOptions"
import { IPlaylist } from "../types"
import { useCallback } from "react"
import { MutationResult } from "react-apollo"
import { IMutationOptions } from "../hook-types"

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

export const useCreatePlaylist = (opts?: IMutationOptions<ICreatePlaylistData>) => {
	const makeUpdatePlaylistCache = useCallback(
		(shareID: string): MutationUpdaterFn<ICreatePlaylistData> => (cache, { data }) => {
			const currentPlaylists = cache.readQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
				query: GET_SHARE_PLAYLISTS,
				variables: { shareID },
			})!.share.playlists

			cache.writeQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
				query: GET_SHARE_PLAYLISTS,
				data: {
					share: {
						id: shareID,
						__typename: "Share",
						playlists: currentPlaylists.concat([data!.createPlaylist]),
					},
				},
				variables: { shareID },
			})
		},
		[],
	)

	const [createPlaylistMutation, other] = useMutation(CREATE_PLAYLIST, opts)

	const createPlaylist = useCallback(
		(shareID: string, name: string) => {
			createPlaylistMutation({
				variables: {
					shareID,
					name,
				},
				update: makeUpdatePlaylistCache(shareID),
			})
		},
		[createPlaylistMutation, makeUpdatePlaylistCache],
	)

	return [createPlaylist, other] as [(shareID: string, name: string) => void, MutationResult<ICreatePlaylistData>]
}
