import gql from "graphql-tag"
import { Playlist, PlaylistSong, playlistSongKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

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

export const GET_PLAYLIST_WITH_SONGS = TransformedGraphQLQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>(gql`
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
`)((data) => data.share.playlist)

export const usePlaylistSongs = (
	shareID: string,
	playlistID: string,
	opts?: IGraphQLQueryOpts<typeof GET_PLAYLIST_WITH_SONGS>,
) => {
	const query = useGraphQLQuery(GET_PLAYLIST_WITH_SONGS, {
		variables: { shareID, playlistID },
		...opts,
	})

	return query
}
