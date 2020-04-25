import { playlistSongKeys, IScopedPlaylistSong } from "../types"
import gql from "graphql-tag"
import { IMutationOptions } from "../hook-types"
import { useMutation, MutationResult } from "react-apollo"
import { useCallback } from "react"

type OrderUpdates = [string, number][]

interface IUpdatePlaylistSongOrderData {
	updateOrderOfPlaylist: IScopedPlaylistSong[]
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

export const useUpdatePlaylistSongOrder = (opts?: IMutationOptions<IUpdatePlaylistSongOrderData>) => {
	const [updatePlaylistSongOrderMutation, other] = useMutation<
		IUpdatePlaylistSongOrderData,
		IUpdatePlaylistSongOrderVariables
	>(UPDATE_PLAYLIST_SONG_ORDER, opts)

	const updateSongOrder = useCallback(
		(shareID: string, playlistID: string, orderUpdates: OrderUpdates) => {
			updatePlaylistSongOrderMutation({
				variables: {
					shareID,
					playlistID,
					orderUpdates,
				},
			})
		},
		[updatePlaylistSongOrderMutation],
	)

	return [updateSongOrder, other] as [
		(shareID: string, playlistID: string, orderUpdates: OrderUpdates) => void,
		MutationResult<IUpdatePlaylistSongOrderData>,
	]
}
