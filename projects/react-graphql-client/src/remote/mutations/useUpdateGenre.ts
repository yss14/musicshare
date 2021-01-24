import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import { GET_GENRES } from "../queries/useGenres"
import { Genre, genreKeys } from "@musicshare/shared-types"

export interface IUpdateGenreData {
	updateGenre: Genre
}

export interface IUpdateGenreVariables {
	genreID: string
	name: string
	group: string
}

export const UPDATE_GENRE = TransformedGraphQLMutation<IUpdateGenreData, IUpdateGenreVariables>(gql`
	mutation updateGenre($genreID: String! $name: String! $group: String!) {
		updateGenre(genreID: $genreID name: $name group: $group){
			${genreKeys}
		}
	}
`)((data) => data.updateGenre)

export const useUpdateGenre = (opts?: IGraphQLMutationOpts<typeof UPDATE_GENRE>) => {
	const mutation = useGraphQLMutation(UPDATE_GENRE, {
		...opts,
		onSuccess: (data, variables, context) => {
			typedQueryClient.setTypedQueryData(
				{
					query: GET_GENRES,
				},
				(currentData) => (currentData || []).map((genre) => (genre.id === data.id ? data : genre)),
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables, context)
		},
	})

	return mutation
}
