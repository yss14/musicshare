import { Query, QueryResult } from "react-apollo";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface ILoggedInData {
  loggedIn: boolean;
}

export const GET_LOGGED_IN = gql`
  query {
    loggedIn @client
  }
`;

export const useLoggedIn = (): QueryResult<ILoggedInData, {}> =>
  useQuery(GET_LOGGED_IN);
