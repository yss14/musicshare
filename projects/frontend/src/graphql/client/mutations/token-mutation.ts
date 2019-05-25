import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

export interface IShareVariables {
  authToken: string;
  refreshToken: string;
}

const UPDATE_TOKENS = gql`
  mutation updateTokens($authToken: String!, $refreshToken: String!) {
    updateTokens(authToken: $authToken, refreshToken: $refreshToken) @client
  }
`;

export const useUpdateToken = ({
  authToken,
  refreshToken
}: IShareVariables) => {
  return useMutation(UPDATE_TOKENS, {
    variables: { authToken, refreshToken }
  });
};
