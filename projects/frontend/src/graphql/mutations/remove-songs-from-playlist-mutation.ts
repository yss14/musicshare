import { playlistSongKeys } from "../types"
import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions } from "@apollo/client"
import { useCallback } from "react"
import { MutationUpdaterFn } from "@apollo/client"
import { IGetPlaylistSongsData, IGetPlaylistSongsVariables, PLAYLIST_WITH_SONGS } from "../queries/playlist-songs"
import { IPlaylistSong } from "@musicshare/shared-types"

interface IRemoveSongsFromPlaylistData {
	removeSongsFromPlaylist: IPlaylistSong[]
}

interface IRemoveSongsFromPlaylistVariables {
	playlistSongIDs: string[]
	playlistID: string
	shareID: string
}

const REMOVE_SONGS_FROM_PLAYLIST = gql`
	mutation RemoveSongsFromPlaylist($shareID: String! $playlistID: String! $playlistSongIDs: [String!]!) {
		removeSongsFromPlaylist(shareID: $shareID playlistID: $playlistID playlistSongIDs: $playlistSongIDs) {
			${playlistSongKeys}
		}
	}
`

export const useRemoveSongsFromPlaylist = (
	opts?: MutationHookOptions<IRemoveSongsFromPlaylistData, IRemoveSongsFromPlaylistVariables>,
) => {
	const [removeSongsFromPlaylistMutation, other] = useMutation<
		IRemoveSongsFromPlaylistData,
		IRemoveSongsFromPlaylistVariables
	>(REMOVE_SONGS_FROM_PLAYLIST, opts)

	const makeUpdateCache = useCallback(
		(
			shareID: string,
			playlistID: string,
			playlistSongIDs: string[],
		): MutationUpdaterFn<IRemoveSongsFromPlaylistData> => (cache, { data }) => {
			if (!data) return

			const variables = {
				shareID,
				playlistID,
			}

			const currentData = cache.readQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
				query: PLAYLIST_WITH_SONGS,
				variables,
			})

			if (!currentData) {
				return console.error(`Cannot update playlist ${playlistID} because playlist not present in cache`)
			}

			cache.writeQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
				query: PLAYLIST_WITH_SONGS,
				variables,
				data: {
					share: {
						...currentData.share,
						playlist: {
							...currentData.share.playlist,
							songs: currentData.share.playlist.songs.filter(
								(song) => !playlistSongIDs.includes(song.playlistSongID),
							),
						},
					},
				},
			})
		},
		[],
	)

	const removeSongsFromPlaylist = useCallback(
		async (shareID: string, playlistID: string, playlistSongIDs: string[]) => {
			await removeSongsFromPlaylistMutation({
				variables: {
					shareID,
					playlistID,
					playlistSongIDs,
				},
				update: makeUpdateCache(shareID, playlistID, playlistSongIDs),
			})
		},
		[removeSongsFromPlaylistMutation, makeUpdateCache],
	)

	return [removeSongsFromPlaylist, other] as [
		(shareID: string, playlistID: string, playlistSongIDs: string[]) => Promise<void>,
		MutationResult<IRemoveSongsFromPlaylistData>,
	]
}
