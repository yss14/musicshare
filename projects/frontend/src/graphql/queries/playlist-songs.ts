import { IPlaylistWithSongs, playlistSongKeys } from "../types"
import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"
import { useHistory } from "react-router-dom"
import { defaultGraphQLErrorHandler } from "../utils/default-graphql-errorhandler"

export interface IGetPlaylistSongsData {
	share: {
		id: string
		__typename: "Share"
		playlist: IPlaylistWithSongs
	}
}

export interface IGetPlaylistSongsVariables {
	shareID: string
	playlistID: string
}

export const PLAYLIST_WITH_SONGS = gql`
	query playlistWithSongs($shareID: String!, $playlistID: String!) {
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

export const usePlaylist = (variables: IGetPlaylistSongsVariables) => {
	const history = useHistory()

	const { data, ...rest } = useQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>(PLAYLIST_WITH_SONGS, {
		variables,
		fetchPolicy: "network-only",
		onError: defaultGraphQLErrorHandler(history),
	})

	return {
		data: data
			? {
					...data.share.playlist,
					songs: data.share.playlist.songs,
			  }
			: undefined,
		...rest,
	}
}
