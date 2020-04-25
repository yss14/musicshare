import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"

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

export const useTags = () => {
	const { data, ...rest } = useQuery<IGetTagsData>(GET_TAGS)

	return {
		data: data ? data.viewer.tags : undefined,
		...rest,
	}
}
