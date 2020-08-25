import gql from "graphql-tag"
import { Playlist, PlaylistSong, playlistSongKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface PlaylistWithSongs extends Playlist {
	songs: PlaylistSong[]
}

export interface IGetPlaylistSongsData {
	share: {
		id: string
		playlist: PlaylistWithSongs
	}
}

export interface IGetPlaylistSongsVariables {
	shareID: string
	playlistID: string
}

export const PLAYLIST_WITH_SONGS = gql`
	query playlistSongs($shareID: String!, $playlistID: String!) {
    	share(shareID: $shareID) {
      		id
      		playlist(playlistID: $playlistID){
				id
				name
				dateAdded
				songs{
					${playlistSongKeys}
				}
			}
    	}
  	}
`

export const usePlaylistSongs = (
	shareID: string,
	playlistID: string,
	opts?: IUseQueryOptions<IGetPlaylistSongsData, IGetPlaylistSongsVariables>,
) => {
	const query = useGraphQLQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>(PLAYLIST_WITH_SONGS, {
		variables: { shareID, playlistID },
		...opts,
	})

	return useMemoizedResult(query, (data) => data.share.playlist)
}
