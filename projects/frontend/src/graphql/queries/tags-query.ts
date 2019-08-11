import gql from "graphql-tag";
import { Query, QueryResult } from "react-apollo";
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

export class TagsQuery extends Query<IGetTagsData, IGetTagsVariables>{ }

export const useTags = ({ variables }: { variables: IGetTagsVariables }) =>
	useQuery<IGetTagsData, IGetTagsVariables>(GET_TAGS, { variables });
