import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_GENRES } from "../queries/useGenres"
import { Genre, genreKeys } from "@musicshare/shared-types"

export interface IAddGenreData {
	addGenre: Genre
}

export interface IAddGenreVariables {
	name: string
	group: string
}

export const ADD_GENRE = TransformedGraphQLMutation<IAddGenreData, IAddGenreVariables>(gql`
	mutation addGenre($name: String! $group: String!) {
		addGenre(name: $name group: $group){
			${genreKeys}
		}
	}
`)((data) => data.addGenre)

export const useAddGenre = (opts?: IGraphQLMutationOpts<typeof ADD_GENRE>) => {
	const mutation = useGraphQLMutation(ADD_GENRE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_GENRES,
				},
				(currentData) => [...(currentData || []), data],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
