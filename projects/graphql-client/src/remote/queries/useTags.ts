import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IGetTagsData {
	viewer: {
		tags: string[]
	}
}

export const GET_TAGS = gql`
	query tags {
		viewer {
			id
			tags
		}
	}
`

export const useTags = (opts?: IUseQueryOptions<IGetTagsData>) => {
	const query = useGraphQLQuery<IGetTagsData>(GET_TAGS, { staleTime: 30e3, ...opts })

	return useMemoizedResult(query, (data) => data.viewer.tags)
}
