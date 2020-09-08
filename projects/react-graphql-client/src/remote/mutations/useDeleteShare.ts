import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_SHARES } from "../queries/useShares"

export interface IDeleteShareData {
	deleteShare: boolean
}

export interface IDeleteShareVariables {
	shareID: string
}

export const DELETE_SHARE = TransformedGraphQLMutation<IDeleteShareData, IDeleteShareVariables>(gql`
	mutation DeleteShare($shareID: String!) {
		deleteShare(shareID: $shareID)
	}
`)((data) => data.deleteShare)

export const useDeleteShare = (opts?: IGraphQLMutationOpts<typeof DELETE_SHARE>) => {
	const mutation = useGraphQLMutation(DELETE_SHARE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_SHARES,
				},
				(currentData) => currentData?.filter((share) => share.id !== variables.shareID) || [],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
