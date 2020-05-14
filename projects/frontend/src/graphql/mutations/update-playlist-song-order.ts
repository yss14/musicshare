import { playlistSongKeys } from "../types"
import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions } from "react-apollo"
import { useCallback } from "react"
import { MutationUpdaterFn } from "apollo-client"
import { IGetPlaylistSongsData, IGetPlaylistSongsVariables, PLAYLIST_WITH_SONGS } from "../queries/playlist-songs"
import { makeScopedSongs } from "../utils/data-transformations"
import { IPlaylistSong } from "@musicshare/shared-types"

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
			if (!data) {
				console.error(`Cannot update playlist ${playlistID} songs due to missing return data from mutation`)

				return
			}

			const currentPlaylistQuery = cache.readQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
				query: PLAYLIST_WITH_SONGS,
				variables: { shareID, playlistID },
			})

			if (!currentPlaylistQuery) {
				console.error(`Cannot update playlist ${playlistID} songs due to missing cache entry`)

				return
			}

			cache.writeQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
				query: PLAYLIST_WITH_SONGS,
				data: {
					...currentPlaylistQuery,
					share: {
						...currentPlaylistQuery.share,
						playlist: {
							...currentPlaylistQuery.share.playlist,
							songs: makeScopedSongs(data.updateOrderOfPlaylist, shareID),
						},
					},
				},
			})
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
