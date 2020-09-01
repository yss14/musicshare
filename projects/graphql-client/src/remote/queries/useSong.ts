import { shareSongKeys, ShareSong } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetSongData {
	share: {
		song: Required<ShareSong>
	}
}

export interface IGetSongVariables {
	shareID: string
	songID: string
}

export const GET_SONG = TransformedGraphQLQuery<IGetSongData, IGetSongVariables>(gql`
	query song ($shareID: String!, $songID: String!){
		share(shareID: $shareID) {
			id,
      		song(id: $songID){
				${shareSongKeys}
			}
    	}
  	}
`)((data) => data.share.song)

export const useSong = (shareID: string, songID: string, opts?: IGraphQLQueryOpts<typeof GET_SONG>) => {
	const query = useGraphQLQuery(GET_SONG, {
		variables: { shareID, songID },
		...opts,
	})

	return query
}
