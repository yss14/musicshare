import gql from "graphql-tag";
import { QueryResult } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import { IShare } from "../types";

export interface IUserData {
	user: {
		id: string;
		shares: IShare[];
	};
}

export const GET_USER = gql`
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

export const useUser = () => useQuery<IUserData, {}>(GET_USER);
