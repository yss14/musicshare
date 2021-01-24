import gql from "graphql-tag"
import { Share, shareKeys } from "@musicshare/shared-types"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import { GET_SHARES } from "../queries/useShares"

export interface ICreateShareVariables {
	name: string
}

export interface ICreateShareData {
	createShare: Share
}

export const CREATE_SHARE = TransformedGraphQLMutation<ICreateShareData, ICreateShareVariables>(gql`
	mutation createShare($name: String!) {
		createShare(name: $name) {
			${shareKeys}
		}
	}
`)((data) => data.createShare)

export const useCreateShare = (opts?: IGraphQLMutationOpts<typeof CREATE_SHARE>) => {
	const mutation = useGraphQLMutation(CREATE_SHARE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryClient.setTypedQueryData(
				{
					query: GET_SHARES,
				},
				(currentData) => [...(currentData || []), data],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
