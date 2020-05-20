import gql from "graphql-tag"
import { useMutation, MutationHookOptions } from "react-apollo"
import { IShareMember } from "@musicshare/shared-types"
import { memberKeys } from "../types"

interface IUpdateShareMemberPermissionsData {
	updateShareMemberPermissions: IShareMember
}

interface IUpdateShareMemberPermissionsVariables {
	shareID: string
	userID: string
	permissions: string[]
}

const UPDATE_SHARE_MEMBER_PERMISSIONS = gql`
	mutation UpdateShareMemberPermissions($shareID: String!, $userID: String!, $permissions: [String!]!) {
		updateShareMemberPermissions(permissions: $permissions, shareID: $shareID, userID: $userID){
			${memberKeys}
		}
	}
`

export const useUpdateShareMemberPermissions = (
	opts?: MutationHookOptions<IUpdateShareMemberPermissionsData, IUpdateShareMemberPermissionsVariables>,
) => {
	const hook = useMutation<IUpdateShareMemberPermissionsData, IUpdateShareMemberPermissionsVariables>(
		UPDATE_SHARE_MEMBER_PERMISSIONS,
		{ ...opts },
	)

	return hook
}
