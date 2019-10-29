import { Query, QueryResult } from "react-apollo";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IShareData {
	shareID: string;
}

export const GET_SHARE_ID = gql`
  query {
    shareID @client
  }
`;

export const useShare = () => useQuery<IShareData, {}>(GET_SHARE_ID);
