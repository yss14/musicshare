import gql from "graphql-tag"
import { ShareMember, memberKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IShareUsersData {
	share: {
		id: string
		members: ShareMember[]
	}
}

export interface IShareUsersVariables {
	shareID: string
}

export const GET_SHARE_USERS = TransformedGraphQLQuery<IShareUsersData, IShareUsersVariables>(gql`
	query shareUsers($shareID: String!) {
		share(shareID: $shareID) {
			id
			members {
				${memberKeys}
			}
		}
	}
`)((data) => data.share.members)

export const useShareUsers = (shareID: string, opts?: IGraphQLQueryOpts<typeof GET_SHARE_USERS>) => {
	const query = useGraphQLQuery(GET_SHARE_USERS, {
		variables: { shareID },
		...opts,
	})

	return query
}
