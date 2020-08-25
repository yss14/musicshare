import { playlistSongKeys } from "../types"
import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { IPlaylistSong } from "@musicshare/shared-types"
import { queryCache } from "react-query"
import { getQueryKey, PLAYLIST_WITH_SONGS } from "@musicshare/graphql-client"

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
			queryCache.invalidateQueries([getQueryKey(PLAYLIST_WITH_SONGS), { shareID, playlistID }])
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
