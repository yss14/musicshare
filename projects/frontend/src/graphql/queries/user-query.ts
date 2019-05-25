import gql from "graphql-tag";
import { QueryResult } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

export interface IUserData {
  user: {
    id: string;
    shares: {
      id: string;
      name: string;
      isLibrary: boolean;
    }[];
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

export const useUser = (): QueryResult<IUserData, {}> => useQuery(GET_USER);
