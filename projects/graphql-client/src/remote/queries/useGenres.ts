import { Genre } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"

export interface IGetGenreData {
	viewer: {
		genres: Genre[]
	}
}

export const GET_GENRES = gql`
	query genres {
		viewer {
			id
			genres {
				name
				group
			}
		}
	}
`

export const useGenres = (opts?: IUseQueryOptions<IGetGenreData>) => {
	const { data, ...rest } = useGraphQLQuery<IGetGenreData>(GET_GENRES, { staleTime: 30e3, ...opts })

	return {
		data: data ? data.viewer.genres : undefined,
		...rest,
	}
}
