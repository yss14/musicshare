import { TransformedGraphQLQuery, useGraphQLQuery } from "../../react-query-graphql"
import gql from "graphql-tag"

export interface IGetAuthData {
	authToken: string | null
	refreshToken: string | null
	isLoggedIn: boolean
}

export const GET_AUTH = TransformedGraphQLQuery<IGetAuthData, {}>(
	gql`
		# client query
		query auth {
			auth {
				authToken
				refreshToken
				isLoggedIn
			}
		}
	`,
)((data) => data)

export const useAuth = () => {
	const query = useGraphQLQuery(GET_AUTH, {
		resolver: () => {
			const authToken = localStorage.getItem("musicshare.authToken")
			const refreshToken = localStorage.getItem("musicshare.refreshToken")

			return {
				authToken,
				refreshToken,
				isLoggedIn: !!authToken && !!refreshToken,
			}
		},
	})

	return query
}
