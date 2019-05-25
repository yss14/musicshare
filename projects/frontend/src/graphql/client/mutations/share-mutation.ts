import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { isReturnStatement } from "@babel/types";

export interface ICreatePlaylistVariables {
  shareID: string;
  name: string;
}

export interface IShareVariables {
  shareID: string;
}

const UPDATE_SHARE_ID = gql`
  mutation updateShareId($shareID: String!) {
    updateShareId(shareID: $shareID) @client
  }
`;

export const useUpdateShare = ({ shareID }: IShareVariables) => {
  return useMutation(UPDATE_SHARE_ID, {
    variables: { shareID }
  });
  isReturnStatement;
};
