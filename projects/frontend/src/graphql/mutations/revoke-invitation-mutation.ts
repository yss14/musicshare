import gql from "graphql-tag";
import { IMutationOptions } from "../hook-types";
import { useMutation } from "react-apollo";

interface IRevokeInvitationData {
	revokeInvitation: boolean;
}

interface IRevokeInvitationVariables {
	input: {
		shareID: string;
		userID: string;
	}
}

const REVOKE_INVITATION = gql`
	mutation RevokeInvitation($input: RevokeInvitationInput!) {
		revokeInvitation(input: $input)
	}
`

export const useRevokeInvitation = (opts?: IMutationOptions<IRevokeInvitationData>) => {
	const hook = useMutation<IRevokeInvitationData, IRevokeInvitationVariables>(REVOKE_INVITATION, opts)

	return hook
}
