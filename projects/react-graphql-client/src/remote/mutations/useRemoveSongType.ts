import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import { GET_SONGTYPES } from "../queries/useSongTypes"

export interface IRemoveSongTypeData {
	removeSongType: boolean
}

export interface IRemoveSongTypeVariables {
	songTypeID: string
}

export const REMOVE_SONG_TYPE = TransformedGraphQLMutation<IRemoveSongTypeData, IRemoveSongTypeVariables>(gql`
	mutation removeSongType($songTypeID: String!) {
		removeSongType(songTypeID: $songTypeID)
	}
`)((data) => data.removeSongType)

export const useRemoveSongType = (opts?: IGraphQLMutationOpts<typeof REMOVE_SONG_TYPE>) => {
	const mutation = useGraphQLMutation(REMOVE_SONG_TYPE, {
		...opts,
		onSuccess: (data, variables, context) => {
			typedQueryClient.invalidateTypedQuery({
				query: GET_SONGTYPES,
			})

			if (opts?.onSuccess) opts.onSuccess(data, variables, context)
		},
	})

	return mutation
}
