import gql from "graphql-tag"
import { shareSongKeys, ShareSong } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetShareSongsData {
	share: {
		id: string
		songs: ShareSong[]
	}
}

export interface IGetShareSongsVariables {
	shareID: string
}

export const GET_SHARE_SONGS = TransformedGraphQLQuery<IGetShareSongsData, IGetShareSongsVariables>(gql`
  	query shareSongs($shareID: String!) {
    	share(shareID: $shareID) {
      		id
      		name
      		songs {
        		${shareSongKeys}
      		}
    	}
  	}
`)((data) => data.share.songs)

export const useShareSongs = (shareID: string, opts?: IGraphQLQueryOpts<typeof GET_SHARE_SONGS>) => {
	const query = useGraphQLQuery<IGetShareSongsData, ShareSong[], IGetShareSongsVariables>(GET_SHARE_SONGS, {
		variables: {
			shareID,
		},
		...opts,
	})

	return query
}
