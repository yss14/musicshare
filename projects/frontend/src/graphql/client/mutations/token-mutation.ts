import gql from "graphql-tag"
import { useMutation, MutationHookOptions, MutationUpdaterFn, MutationResult } from "@apollo/client"
import { useCallback } from "react"
import { IAuthTokenData, GET_AUTH_TOKEN, IRefreshTokenData, GET_REFRESH_TOKEN } from "../queries/auth-token-query"

type Token = string | null

export interface IShareVariables {
	authToken: Token
	refreshToken: Token
}

const UPDATE_TOKENS = gql`
	mutation updateTokens($authToken: String!, $refreshToken: String!) {
		updateTokens(authToken: $authToken, refreshToken: $refreshToken) @client
	}
`

export const useSetAuthTokens = (opts?: MutationHookOptions<void, IShareVariables>) => {
	const [setAuthTokensMutation, other] = useMutation<void, IShareVariables>(UPDATE_TOKENS, opts)

	const makeUpdateCache = useCallback(
		(authToken: Token, refreshToken: Token): MutationUpdaterFn<void> => (cache) => {
			cache.writeQuery<IAuthTokenData>({
				query: GET_AUTH_TOKEN,
				data: {
					authToken,
				},
			})
			cache.writeQuery<IRefreshTokenData>({
				query: GET_REFRESH_TOKEN,
				data: {
					refreshToken,
				},
			})
		},
		[],
	)

	const setAuthTokens = useCallback(
		(authToken: Token, refreshToken: Token) => {
			setAuthTokensMutation({
				variables: {
					authToken,
					refreshToken,
				},
				update: makeUpdateCache(authToken, refreshToken),
			})
		},
		[setAuthTokensMutation, makeUpdateCache],
	)

	return [setAuthTokens, other] as [(authToken: Token, refreshToken: Token) => void, MutationResult<void>]
}
