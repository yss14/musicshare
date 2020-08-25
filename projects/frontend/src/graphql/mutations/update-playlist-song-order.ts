import { playlistSongKeys } from "../types"
import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { IPlaylistSong } from "@musicshare/shared-types"
import { queryCache } from "react-query"
import { getQueryKey, PLAYLIST_WITH_SONGS } from "@musicshare/graphql-client"

type OrderUpdates = [string, number][]

interface IUpdatePlaylistSongOrderData {
	updateOrderOfPlaylist: IPlaylistSong[]
}

interface IUpdatePlaylistSongOrderVariables {
	shareID: string
	playlistID: string
	orderUpdates: OrderUpdates
}

const UPDATE_PLAYLIST_SONG_ORDER = gql`
	mutation UpdatePlaylistSongOrder($shareID: String! $playlistID: String! $orderUpdates: [OrderUpdate!]!) {
		updateOrderOfPlaylist(shareID: $shareID playlistID: $playlistID orderUpdates: $orderUpdates) {
			${playlistSongKeys}
		}
	}
`

export const useUpdatePlaylistSongOrder = (
	opts?: MutationHookOptions<IUpdatePlaylistSongOrderData, IUpdatePlaylistSongOrderVariables>,
) => {
	const [updatePlaylistSongOrderMutation, other] = useMutation<
		IUpdatePlaylistSongOrderData,
		IUpdatePlaylistSongOrderVariables
	>(UPDATE_PLAYLIST_SONG_ORDER, opts)

	const updatePlaylistSongsCache = useCallback(
		(shareID: string, playlistID: string): MutationUpdaterFn<IUpdatePlaylistSongOrderData> => (cache, { data }) => {
			queryCache.invalidateQueries([getQueryKey(PLAYLIST_WITH_SONGS), { shareID, playlistID }])
		},
		[],
	)

	const updateSongOrder = useCallback(
		(shareID: string, playlistID: string, orderUpdates: OrderUpdates) => {
			updatePlaylistSongOrderMutation({
				variables: {
					shareID,
					playlistID,
					orderUpdates,
				},
				update: updatePlaylistSongsCache(shareID, playlistID),
			})
		},
		[updatePlaylistSongOrderMutation, updatePlaylistSongsCache],
	)

	return [updateSongOrder, other] as [
		(shareID: string, playlistID: string, orderUpdates: OrderUpdates) => void,
		MutationResult<IUpdatePlaylistSongOrderData>,
	]
}
