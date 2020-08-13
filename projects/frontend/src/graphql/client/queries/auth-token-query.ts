import gql from "graphql-tag"
import { useQuery, ApolloClient } from "@apollo/client"
import { NormalizedCacheObject } from "apollo-cache-inmemory"

export interface IAuthTokenData {
	authToken: string | null
}

export const GET_AUTH_TOKEN = gql`
	query {
		authToken @client
	}
`

export const useAuthToken = (): string | null => {
	const { data } = useQuery<IAuthTokenData>(GET_AUTH_TOKEN)

	return data ? data.authToken : null
}

export interface IRefreshTokenData {
	refreshToken: string | null
}

export const GET_REFRESH_TOKEN = gql`
	query {
		refreshToken @client
	}
`

export const useRefreshToken = (): string | null => {
	const { data } = useQuery<IRefreshTokenData>(GET_AUTH_TOKEN)

	return data ? data.refreshToken : null
}

export const getRefreshToken = async (client: ApolloClient<NormalizedCacheObject>) => {
	const { data } = await client.query<IRefreshTokenData>({
		query: GET_REFRESH_TOKEN,
	})

	return data?.refreshToken
}
