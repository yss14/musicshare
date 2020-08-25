import gql from "graphql-tag"
import { shareSongKeys, ShareSong } from "@musicshare/shared-types"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IGetShareSongsData {
	share: {
		id: string
		songs: ShareSong[]
	}
}

export interface IGetShareSongsVariables {
	shareID: string
}

export const GET_SHARE_SONGS = gql`
  	query shareSongs($shareID: String!) {
    	share(shareID: $shareID) {
      		id
      		name
      		songs {
        		${shareSongKeys}
      		}
    	}
  	}
`

export const useShareSongs = (
	shareID: string,
	opts?: IUseQueryOptions<IGetShareSongsData, IGetShareSongsVariables>,
) => {
	const query = useGraphQLQuery<IGetShareSongsData, IGetShareSongsVariables>(GET_SHARE_SONGS, {
		variables: {
			shareID,
		},
		...opts,
	})

	return useMemoizedResult(query, (data) => data.share.songs)
}
