import gql from "graphql-tag"
import { ShareSong, shareSongKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

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

export const SEARCH_SONG = gql`
	query searchSongs($query: String!, $matcher: [SongSearchMatcher!], $limit: Int = 20) {
		viewer {
			id
			searchSongs(query: $query, matcher: $matcher, limit: $limit){
				${shareSongKeys}
			}
		}
	}
`

export const useSongSearch = (
	variables: ISongSearchVariables,
	opts?: IUseQueryOptions<ISongSearchData, ISongSearchVariables>,
) => {
	const query = useGraphQLQuery<ISongSearchData, ISongSearchVariables>(SEARCH_SONG, {
		variables,
		enabled: variables.query.trim().length > 2,
		...opts,
	})

	return useMemoizedResult(query, (data) => data.viewer.searchSongs)
}
