import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { IShare, shareKeys } from "../types";

export interface IUserData {
	viewer: {
		id: string;
		shares: IShare[];
	};
}

export const GET_USER = gql`
  query user {
    viewer {
      id
      shares {
        ${shareKeys}
      }
    }
  }
`;

export const useUser = () => useQuery<IUserData, {}>(GET_USER);
