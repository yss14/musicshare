import gql from "graphql-tag"
import { ShareMember, memberKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IShareUsersData {
	share: {
		id: string
		members: ShareMember[]
	}
}

export interface IShareUsersVariables {
	shareID: string
}

export const GET_SHARE_USERS = gql`
	query shareUsers($shareID: String!) {
		share(shareID: $shareID) {
			id
			members {
				${memberKeys}
			}
		}
	}
`

export const useShareUsers = (shareID: string, opts?: IUseQueryOptions<IShareUsersData, IShareUsersVariables>) => {
	const query = useGraphQLQuery<IShareUsersData, IShareUsersVariables>(GET_SHARE_USERS, {
		variables: { shareID },
		...opts,
	})

	return useMemoizedResult(query, (data) => data.share.members)
}
