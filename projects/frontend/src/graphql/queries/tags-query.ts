import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IGetTagsData {
	share: {
		tags: string[];
	}
}

export interface IGetTagsVariables {
	shareID: string;
}

export const GET_TAGS = gql`
	query tags($shareID: String!){
		share(shareID: $shareID) {
			id,
			tags
		}
	}
`;

export const useTags = (shareID: string) =>
	useQuery<IGetTagsData, IGetTagsVariables>(GET_TAGS, { variables: { shareID } });
