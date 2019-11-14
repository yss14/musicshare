import { IUser, userKeys } from "../types";
import gql from "graphql-tag";
import { useQuery } from "react-apollo";

export interface IShareUsersData {
	share: {
		id: string;
		users: IUser[];
	}
}

export interface IShareUsersVariables {
	shareID: string;
}

const SHARE_USERS = gql`
	query ShareUsers($shareID: String!) {
		share(shareID: $shareID) {
			id
			users {
				${userKeys}
			}
		}
	}
`

export const useShareUsers = (shareID: string) => {
	const { data, ...rest } = useQuery<IShareUsersData, IShareUsersVariables>(SHARE_USERS, {
		variables: { shareID },
	})

	return {
		data: data ? data.share.users : undefined,
		...rest,
	}
}