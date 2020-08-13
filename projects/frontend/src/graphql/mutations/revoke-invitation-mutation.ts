import gql from "graphql-tag"
import { useMutation, MutationHookOptions } from "@apollo/client"

interface IRevokeInvitationData {
	revokeInvitation: boolean
}

interface IRevokeInvitationVariables {
	input: {
		shareID: string
		userID: string
	}
}

const REVOKE_INVITATION = gql`
	mutation RevokeInvitation($input: RevokeInvitationInput!) {
		revokeInvitation(input: $input)
	}
`

export const useRevokeInvitation = (opts?: MutationHookOptions<IRevokeInvitationData, IRevokeInvitationVariables>) => {
	const hook = useMutation<IRevokeInvitationData, IRevokeInvitationVariables>(REVOKE_INVITATION, opts)

	return hook
}
