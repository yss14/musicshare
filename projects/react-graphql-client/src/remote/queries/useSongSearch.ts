import gql from "graphql-tag"
import { ShareSong, shareSongKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface ISongSearchData {
	viewer: {
		searchSongs: ShareSong[]
	}
}

export interface ISongSearchVariables {
	query: string
	matcher?: string[]
	limit?: number
}

export const SEARCH_SONG = TransformedGraphQLQuery<ISongSearchData, ISongSearchVariables>(gql`
	query searchSongs($query: String!, $matcher: [SongSearchMatcher!], $limit: Int = 20) {
		viewer {
			id
			searchSongs(query: $query, matcher: $matcher, limit: $limit){
				${shareSongKeys}
			}
		}
	}
`)((data) => data.viewer.searchSongs)

export const useSongSearch = (variables: ISongSearchVariables, opts?: IGraphQLQueryOpts<typeof SEARCH_SONG>) => {
	const query = useGraphQLQuery(SEARCH_SONG, {
		variables,
		enabled: variables.query.trim().length > 2,
		...opts,
	})

	return query
}
