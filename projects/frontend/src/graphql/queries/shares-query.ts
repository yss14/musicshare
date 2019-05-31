import gql from "graphql-tag";
import { Query, QueryResult } from "react-apollo";
import { IShare } from "../types";
import { useQuery } from "@apollo/react-hooks";

export interface IGetSharesData {
	user: {
		shares: IShare[];
	};
}

export interface IGetSharesVariables {
	id: string;
}

export const GET_SHARES = gql`
  query user {
    user {
      id
      shares {
        id
        name
        isLibrary
      }
    }
  }
`;

export const useShares = (): QueryResult<IGetSharesData, {}> =>
	useQuery(GET_SHARES);
