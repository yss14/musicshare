import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_SHARES } from "../queries/useShares"

interface ILeaveShareData {
	leaveShare: boolean
}

interface ILeaveShareVariables {
	input: {
		shareID: string
	}
}

const LEAVE_SHARE = TransformedGraphQLMutation<ILeaveShareData, ILeaveShareVariables>(gql`
	mutation leaveShare($input: ShareIDInput!) {
		leaveShare(input: $input)
	}
`)((data) => data.leaveShare)

export const useLeaveShare = (opts?: IGraphQLMutationOpts<typeof LEAVE_SHARE>) => {
	const mutation = useGraphQLMutation(LEAVE_SHARE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_SHARES,
				},
				(currentData) => currentData?.filter((share) => share.id !== variables.input.shareID) || [],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
