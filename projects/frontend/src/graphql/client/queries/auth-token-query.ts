import { Query, QueryResult } from "react-apollo";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IUserData {
  authToken: string;
}

export const GET_AUTH_TOKEN = gql`
  query {
    authToken @client
  }
`;

export const useAuthToken = (): QueryResult<IUserData, {}> =>
  useQuery(GET_AUTH_TOKEN);
