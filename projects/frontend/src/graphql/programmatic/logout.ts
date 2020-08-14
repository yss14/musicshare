import { ApolloClient, NormalizedCacheObject } from "@apollo/client"
import {
	IAuthTokenData,
	GET_AUTH_TOKEN,
	IRefreshTokenData,
	GET_REFRESH_TOKEN,
} from "../client/queries/auth-token-query"
import { cache } from "../../Apollo"

export const logoutUser = (client: ApolloClient<NormalizedCacheObject>) => {
	localStorage.removeItem("auth-token")
	localStorage.removeItem("refresh-token")

	client.writeQuery<IAuthTokenData>({
		query: GET_AUTH_TOKEN,
		data: {
			authToken: null,
		},
	})
	cache.writeQuery<IRefreshTokenData>({
		query: GET_REFRESH_TOKEN,
		data: {
			refreshToken: null,
		},
	})
}
