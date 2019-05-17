import gql from "graphql-tag";
import { Query } from "react-apollo";
import { IShare } from "../types";

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
      shares {
        id
        name
        userID
        isLibrary
      }
    }
  }
`;

export class ShareQuery extends Query<IGetSharesData, IGetSharesVariables> { }