import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_GENRES } from "../queries/useGenres"

export interface IRemoveGenreData {
	removeGenre: boolean
}

export interface IRemoveGenreVariables {
	genreID: string
}

export const REMOVE_GENRE = TransformedGraphQLMutation<IRemoveGenreData, IRemoveGenreVariables>(gql`
	mutation removeGenre($genreID: String!) {
		removeGenre(genreID: $genreID)
	}
`)((data) => data.removeGenre)

export const useRemoveGenre = (opts?: IGraphQLMutationOpts<typeof REMOVE_GENRE>) => {
	const mutation = useGraphQLMutation(REMOVE_GENRE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.invalidateTypedQuery({
				query: GET_GENRES,
			})

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
