import { Query, QueryResult } from "react-apollo";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IUserData {
  userID: string;
}

export const GET_USER_ID = gql`
  query {
    userID @client
  }
`;

export const useUser = (): QueryResult<IUserData, {}> => useQuery(GET_USER_ID);
