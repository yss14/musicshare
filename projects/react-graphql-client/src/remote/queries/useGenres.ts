import { Genre, genreKeys } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetGenreData {
	viewer: {
		genres: Genre[]
	}
}

export const GET_GENRES = TransformedGraphQLQuery<IGetGenreData>(gql`
	query genres {
		viewer {
			id
			genres {
				${genreKeys}
			}
		}
	}
`)((data) => data.viewer.genres)

export const useGenres = (opts?: IGraphQLQueryOpts<typeof GET_GENRES>) => {
	const query = useGraphQLQuery(GET_GENRES, { staleTime: 30e3, ...opts })

	return query
}
