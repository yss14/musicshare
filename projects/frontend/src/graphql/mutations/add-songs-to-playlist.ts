import { playlistSongKeys } from "../types"
import { useMutation, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import gql from "graphql-tag"
import { useCallback } from "react"
import { getQueryKey, PLAYLIST_WITH_SONGS } from "@musicshare/graphql-client"
import { IPlaylistSong } from "@musicshare/shared-types"
import { queryCache } from "react-query"

export interface IAddSongsToPlaylistVariables {
	shareID: string
	playlistID: string
	songIDs: string[]
}

export interface IAddSongsToPlaylistData {
	addSongsToPlaylist: IPlaylistSong[]
}

export const ADD_SONGS_TO_PLAYLIST = gql`
	mutation AddSongsToPlaylist($shareID: String!, $playlistID: String!, $songIDs: [String!]!){
		addSongsToPlaylist(shareID: $shareID, playlistID: $playlistID, songIDs: $songIDs){
			${playlistSongKeys}
		}
	}
`

export const useAddSongsToPlaylist = (
	opts?: MutationHookOptions<IAddSongsToPlaylistData, IAddSongsToPlaylistVariables>,
) => {
	const [invokeMutation] = useMutation<IAddSongsToPlaylistData, IAddSongsToPlaylistVariables>(
		ADD_SONGS_TO_PLAYLIST,
		opts,
	)

	const updatePlaylistSongsCache = useCallback(
		(shareID: string, playlistID: string): MutationUpdaterFn<IAddSongsToPlaylistData> => (cache, { data }) => {
			queryCache.invalidateQueries([getQueryKey(PLAYLIST_WITH_SONGS), { shareID, playlistID }])
		},
		[],
	)

	return (shareID: string, playlistID: string, songIDs: string[]) =>
		invokeMutation({
			variables: {
				shareID,
				playlistID,
				songIDs,
			},
			update: updatePlaylistSongsCache(shareID, playlistID),
		})
}
