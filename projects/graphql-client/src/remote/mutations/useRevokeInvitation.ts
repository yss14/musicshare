import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_SHARE_USERS } from "../queries/useShareUsers"

interface IRevokeInvitationData {
	revokeInvitation: boolean
}

interface IRevokeInvitationVariables {
	input: {
		shareID: string
		userID: string
	}
}

const REVOKE_INVITATION = TransformedGraphQLMutation<IRevokeInvitationData, IRevokeInvitationVariables>(gql`
	mutation revokeInvitation($input: RevokeInvitationInput!) {
		revokeInvitation(input: $input)
	}
`)((data) => data.revokeInvitation)

export const useRevokeInvitation = (opts?: IGraphQLMutationOpts<typeof REVOKE_INVITATION>) => {
	const mutation = useGraphQLMutation(REVOKE_INVITATION, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.invalidateTypedQuery({
				query: GET_SHARE_USERS,
				variables: { shareID: variables.input.shareID },
			})

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}