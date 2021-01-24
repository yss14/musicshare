import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import { GET_SHARE_USERS } from "../queries/useShareUsers"

export interface IInviteToShareData {
	inviteToShare: string | null
}

export interface IInviteToShareVariables {
	input: {
		shareID: string
		email: string
	}
}

export const INVITE_TO_SHARE = TransformedGraphQLMutation<IInviteToShareData, IInviteToShareVariables>(gql`
	mutation inviteToShare($input: InviteToShareInput!) {
		inviteToShare(input: $input)
	}
`)((data) => data.inviteToShare)

export const useInviteToShare = (opts?: IGraphQLMutationOpts<typeof INVITE_TO_SHARE>) => {
	const hook = useGraphQLMutation(INVITE_TO_SHARE, {
		...opts,
		onSuccess: (data, variables, context) => {
			typedQueryClient.invalidateTypedQuery({
				query: GET_SHARE_USERS,
				variables: { shareID: variables.input.shareID },
			})

			if (opts?.onSuccess) opts.onSuccess(data, variables, context)
		},
	})

	return hook
}
