import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useCallback } from "react";
import { MutationFunctionOptions, MutationResult } from "@apollo/react-common";
import { IMutationOptions } from "../../hook-types";

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

	const setAuthTokens = useCallback((authToken: Token, refreshToken: Token) => {
		setAuthTokensMutation({
			variables: {
				authToken,
				refreshToken,
			},
		})
	}, [setAuthTokensMutation])

	return [setAuthTokens, other] as [(authToken: Token, refreshToken: Token) => void, MutationResult<void>]
};
