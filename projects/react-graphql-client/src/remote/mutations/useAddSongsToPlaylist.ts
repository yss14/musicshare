import gql from "graphql-tag"
import { PlaylistSong, playlistSongKeys } from "@musicshare/shared-types"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_PLAYLIST_WITH_SONGS } from "../queries/usePlaylistSongs"

export interface IAddSongsToPlaylistVariables {
	shareID: string
	playlistID: string
	songIDs: string[]
}

export interface IAddSongsToPlaylistData {
	addSongsToPlaylist: PlaylistSong[]
}

export const ADD_SONGS_TO_PLAYLIST = TransformedGraphQLMutation<
	IAddSongsToPlaylistData,
	IAddSongsToPlaylistVariables
>(gql`
	mutation addSongsToPlaylist($shareID: String!, $playlistID: String!, $songIDs: [String!]!){
		addSongsToPlaylist(shareID: $shareID, playlistID: $playlistID, songIDs: $songIDs){
			${playlistSongKeys}
		}
	}
`)((data) => data.addSongsToPlaylist)

export const useAddSongsToPlaylist = (opts?: IGraphQLMutationOpts<typeof ADD_SONGS_TO_PLAYLIST>) => {
	const mutation = useGraphQLMutation(ADD_SONGS_TO_PLAYLIST, {
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
