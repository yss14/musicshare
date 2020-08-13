import { memberKeys } from "../types"
import gql from "graphql-tag"
import { useQuery } from "@apollo/client"
import { IShareMember } from "@musicshare/shared-types"

export interface IShareUsersData {
	share: {
		id: string
		members: IShareMember[]
	}
}

export interface IShareUsersVariables {
	shareID: string
}

const SHARE_USERS = gql`
	query ShareUsers($shareID: String!) {
		share(shareID: $shareID) {
			id
			members {
				${memberKeys}
			}
		}
	}
`

export const useShareUsers = (shareID: string) => {
	const { data, ...rest } = useQuery<IShareUsersData, IShareUsersVariables>(SHARE_USERS, {
		variables: { shareID },
		fetchPolicy: "network-only",
	})

	return {
		data: data ? data.share.members : undefined,
		...rest,
	}
}
