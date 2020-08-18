import { shareSongKeys, ShareSong } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"

export interface IGetSongData {
	share: {
		song: Required<ShareSong>
	}
}

export interface IGetSongVariables {
	shareID: string
	songID: string
}

export const GET_SONG = gql`
	query song ($shareID: String!, $songID: String!){
		share(shareID: $shareID) {
			id,
      		song(id: $songID){
				${shareSongKeys}
			}
    	}
  	}
`

export const useSong = (shareID: string, songID: string, opts?: IUseQueryOptions<IGetSongData, IGetSongVariables>) => {
	const { data, ...rest } = useGraphQLQuery<IGetSongData, IGetSongVariables>(GET_SONG, {
		variables: { shareID, songID },
		...opts,
	})

	return {
		data: data ? data.share.song : undefined,
		...rest,
	}
}
