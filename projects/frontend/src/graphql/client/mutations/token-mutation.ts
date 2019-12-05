import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useCallback } from "react";
import { MutationFunctionOptions, MutationResult } from "@apollo/react-common";

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

export const useSetAuthTokens = () => {
	const [setAuthTokensMutation, other] = useMutation<void, IShareVariables>(UPDATE_TOKENS)

	const setAuthTokens = useCallback((authToken: Token, refreshToken: Token, opts?: MutationFunctionOptions<void, IShareVariables>) => {
		setAuthTokensMutation({
			...(opts || {}),
			variables: {
				authToken,
				refreshToken,
			},
		})
	}, [setAuthTokensMutation])

	return [setAuthTokens, other] as [
		(authToken: Token, refreshToken: Token, opts?: MutationFunctionOptions<void, IShareVariables>) => void,
		MutationResult<void>
	]
};
