import { IUser, userKeys } from "../types"
import gql from "graphql-tag"
import { useMutation, MutationResult } from "react-apollo"
import { useCallback } from "react"
import { IMutationOptions } from "../hook-types"

interface IAcceptInvitationData {
	acceptInvitation: {
		user: IUser
		restoreToken: string
	}
}

interface IAcceptInvitationInput {
	name: string
	password: string
	invitationToken: string
}

interface IAcceptInvitationVariables {
	input: IAcceptInvitationInput
}

const ACCEPT_INVITATION = gql`
	mutation AcceptInvitation($input: AcceptInvitationInput!) {
		acceptInvitation(input: $input){
			user{
				${userKeys}
			}
			restoreToken
		}
	}
`

export const useAcceptInvitation = (opts?: IMutationOptions<IAcceptInvitationData>) => {
	const [acceptInvitationMutation, other] = useMutation<IAcceptInvitationData, IAcceptInvitationVariables>(
		ACCEPT_INVITATION,
		opts,
	)

	const acceptInvitation = useCallback(
		(input: IAcceptInvitationInput) => {
			acceptInvitationMutation({
				variables: { input },
			})
		},
		[acceptInvitationMutation],
	)

	return [acceptInvitation, other] as [(input: IAcceptInvitationInput) => void, MutationResult<IAcceptInvitationData>]
}
