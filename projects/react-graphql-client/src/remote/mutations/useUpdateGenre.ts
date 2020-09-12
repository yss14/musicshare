import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_GENRES } from "../queries/useGenres"
import { Genre, genreKeys } from "@musicshare/shared-types"

export interface IUpdateGenreData {
	updateGenre: Genre
}

export interface IUpdateGenreVariables {
	name: string
	group: string
	alternativeNames: []
	hasArtists: boolean
}

export const UPDATE_GENRE = TransformedGraphQLMutation<IUpdateGenreData, IUpdateGenreVariables>(gql`
	mutation updateGenre($genreID: String! $name: String! $group: String! $alternativeNames: [String!]! $hasArtists: Boolean!) {
		updateGenre(genreID: $genreID name: $name group: $group alternativeNames: $alternativeNames hasArtists: $hasArtists){
			${genreKeys}
		}
	}
`)((data) => data.updateGenre)

export const useUpdateGenre = (opts?: IGraphQLMutationOpts<typeof UPDATE_GENRE>) => {
	const mutation = useGraphQLMutation(UPDATE_GENRE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_GENRES,
				},
				(currentData) => (currentData || []).map((genre) => (genre.id === data.id ? data : genre)),
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
