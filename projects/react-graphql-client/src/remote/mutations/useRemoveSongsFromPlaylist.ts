import gql from "graphql-tag"
import { PlaylistSong, playlistSongKeys } from "@musicshare/shared-types"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_PLAYLIST_WITH_SONGS } from "../queries/usePlaylistSongs"

interface IRemoveSongsFromPlaylistData {
	removeSongsFromPlaylist: PlaylistSong[]
}

interface IRemoveSongsFromPlaylistVariables {
	playlistSongIDs: string[]
	playlistID: string
	shareID: string
}

const REMOVE_SONGS_FROM_PLAYLIST = TransformedGraphQLMutation<
	IRemoveSongsFromPlaylistData,
	IRemoveSongsFromPlaylistVariables
>(gql`
	mutation removeSongsFromPlaylist($shareID: String! $playlistID: String! $playlistSongIDs: [String!]!) {
		removeSongsFromPlaylist(shareID: $shareID playlistID: $playlistID playlistSongIDs: $playlistSongIDs) {
			${playlistSongKeys}
		}
	}
`)((data) => data.removeSongsFromPlaylist)

export const useRemoveSongsFromPlaylist = (opts?: IGraphQLMutationOpts<typeof REMOVE_SONGS_FROM_PLAYLIST>) => {
	const mutation = useGraphQLMutation(REMOVE_SONGS_FROM_PLAYLIST, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_PLAYLIST_WITH_SONGS,
					variables: { shareID: variables.shareID, playlistID: variables.playlistID },
				},
				(currentData) => ({ ...currentData!, songs: data }),
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
