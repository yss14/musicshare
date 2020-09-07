import gql from "graphql-tag"
import { ShareMember, memberKeys } from "@musicshare/shared-types"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_SHARE_USERS } from "../queries/useShareUsers"

interface IUpdateShareMemberPermissionsData {
	updateShareMemberPermissions: ShareMember
}

interface IUpdateShareMemberPermissionsVariables {
	shareID: string
	userID: string
	permissions: string[]
}

const UPDATE_SHARE_MEMBER_PERMISSIONS = TransformedGraphQLMutation<
	IUpdateShareMemberPermissionsData,
	IUpdateShareMemberPermissionsVariables
>(gql`
	mutation updateShareMemberPermissions($shareID: String!, $userID: String!, $permissions: [String!]!) {
		updateShareMemberPermissions(permissions: $permissions, shareID: $shareID, userID: $userID){
			${memberKeys}
		}
	}
`)((data) => data.updateShareMemberPermissions)

export const useUpdateShareMemberPermissions = (
	opts?: IGraphQLMutationOpts<typeof UPDATE_SHARE_MEMBER_PERMISSIONS>,
) => {
	const mutation = useGraphQLMutation(UPDATE_SHARE_MEMBER_PERMISSIONS, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.invalidateTypedQuery({
				query: GET_SHARE_USERS,
				variables: { shareID: variables.shareID },
			})
			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
