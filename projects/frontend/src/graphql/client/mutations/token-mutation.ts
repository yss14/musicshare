import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useCallback } from "react";
import { MutationResult } from "@apollo/react-common";
import { IMutationOptions } from "../../hook-types";
import { MutationUpdaterFn } from "apollo-client";

type Token = string | null

export interface IShareVariables {
	authToken: Token;
	refreshToken: Token;
}

const UPDATE_TOKENS = gql`
  mutation updateTokens($authToken: String!, $refreshToken: String!) {
    updateTokens(authToken: $authToken, refreshToken: $refreshToken) @client
  }
`;

export const useSetAuthTokens = (opts?: IMutationOptions<void>) => {
	const [setAuthTokensMutation, other] = useMutation<void, IShareVariables>(UPDATE_TOKENS, opts)

	const makeUpdateCache = useCallback((authToken: Token, refreshToken: Token): MutationUpdaterFn<void> => (cache) => {
		cache.writeData({
			data: {
				authToken,
				refreshToken,
			}
		});
	}, [])

	const setAuthTokens = useCallback((authToken: Token, refreshToken: Token) => {
		setAuthTokensMutation({
			variables: {
				authToken,
				refreshToken,
			},
			update: makeUpdateCache(authToken, refreshToken),
		})
	}, [setAuthTokensMutation, makeUpdateCache])

	return [setAuthTokens, other] as [(authToken: Token, refreshToken: Token) => void, MutationResult<void>]
};
