import gql from "graphql-tag"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetTagsData {
	viewer: {
		tags: string[]
	}
}

export const GET_TAGS = TransformedGraphQLQuery<IGetTagsData>(gql`
	query tags {
		viewer {
			id
			tags
		}
	}
`)((data) => data.viewer.tags)

export const useTags = (opts?: IGraphQLQueryOpts<typeof GET_TAGS>) => {
	const query = useGraphQLQuery(GET_TAGS, { staleTime: 30e3, ...opts })

	return query
}
