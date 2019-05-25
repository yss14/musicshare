import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

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
};
