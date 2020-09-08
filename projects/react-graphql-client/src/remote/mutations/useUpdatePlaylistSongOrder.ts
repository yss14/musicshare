import gql from "graphql-tag"
import { PlaylistSong, playlistSongKeys } from "@musicshare/shared-types"
import {
	TransformedGraphQLMutation,
	useGraphQLMutation,
	IGraphQLMutationOpts,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_PLAYLIST_WITH_SONGS } from "../queries/usePlaylistSongs"

export interface IUpdatePlaylistSongOrderData {
	updateOrderOfPlaylist: PlaylistSong[]
}

export interface IUpdatePlaylistSongOrderVariables {
	shareID: string
	playlistID: string
	orderUpdates: [string, number][]
}

export const UPDATE_PLAYLIST_SONG_ORDER = TransformedGraphQLMutation<
	IUpdatePlaylistSongOrderData,
	IUpdatePlaylistSongOrderVariables
>(gql`
	mutation UpdatePlaylistSongOrder($shareID: String! $playlistID: String! $orderUpdates: [OrderUpdate!]!) {
		updateOrderOfPlaylist(shareID: $shareID playlistID: $playlistID orderUpdates: $orderUpdates) {
			${playlistSongKeys}
		}
	}
`)((data) => data.updateOrderOfPlaylist)

export const useUpdatePlaylistSongOrder = (opts?: IGraphQLMutationOpts<typeof UPDATE_PLAYLIST_SONG_ORDER>) => {
	const mutation = useGraphQLMutation(UPDATE_PLAYLIST_SONG_ORDER, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_PLAYLIST_WITH_SONGS,
					variables: { shareID: variables.shareID, playlistID: variables.playlistID },
				},
				(currentData) => ({
					...currentData!,
					songs: data,
				}),
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
