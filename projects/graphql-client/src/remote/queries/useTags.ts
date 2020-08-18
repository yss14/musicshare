import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"

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
	const { data, ...rest } = useGraphQLQuery<IGetTagsData>(GET_TAGS, { staleTime: 30e3, ...opts })

	return {
		data: data ? data.viewer.tags : undefined,
		...rest,
	}
}
