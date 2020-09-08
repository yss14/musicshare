import gql from "graphql-tag"
import { Viewer, userKeys } from "@musicshare/shared-types"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

export interface IAcceptInvitationData {
	acceptInvitation: {
		user: Viewer
		restoreToken: string
	}
}

export interface IAcceptInvitationInput {
	name: string
	password: string
	invitationToken: string
}

export interface IAcceptInvitationVariables {
	input: IAcceptInvitationInput
}

export const ACCEPT_INVITATION = TransformedGraphQLMutation<IAcceptInvitationData, IAcceptInvitationVariables>(gql`
	mutation acceptInvitation($input: AcceptInvitationInput!) {
		acceptInvitation(input: $input){
			user{
				${userKeys}
			}
			restoreToken
		}
	}
`)((data) => data.acceptInvitation)

export const useAcceptInvitation = (opts?: IGraphQLMutationOpts<typeof ACCEPT_INVITATION>) => {
	const mutation = useGraphQLMutation(ACCEPT_INVITATION, opts)

	return mutation
}
