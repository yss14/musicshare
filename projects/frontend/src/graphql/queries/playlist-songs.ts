import { IPlaylistWithSongs, playlistSongKeys } from "../types"
import gql from "graphql-tag"
import { useQuery } from "@apollo/client"
import { useHistory } from "react-router-dom"
import { defaultGraphQLErrorHandler } from "../utils/default-graphql-errorhandler"

//type TypeKeys<T> = (keyof T)

type TypeKeys<TType> = (keyof TType)[]

interface IGraphQLQueryOpts<TType, Keys extends TypeKeys<TType>>{
	variables?: Record<string, unknown>
	keys: Record<keyof TType, 
}

interface IGraphQLQuery<TType, K extends TypeKeys<TType>>{
	data: Pick<TType, Extract<keyof TType, K>>
}
// IRecord<Extract<T, IColumns>>

const query = <TType>() => <Subset extends TypeKeys<TType>>(opts: IGraphQLQueryOpts<TType, Subset>): IGraphQLQuery<TType, IGraphQLQueryOpts<TVar, TType>['keys']> => {

}

const test = query<IPlaylistWithSongs>()({
	keys: ["id", "name"]
})
test.data.

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
