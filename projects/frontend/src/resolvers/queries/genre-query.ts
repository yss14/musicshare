import { IGenre } from "../types";
import gql from "graphql-tag";
import { Query } from "react-apollo";

export interface IGetGenreData {
	share: {
		genres: IGenre[];
	}
}

export interface IGetGenreVariables {
	shareID: string;
}

export const GET_GENRES = gql`
	query genres($shareID: String!){
		share(shareID: $shareID) {
			id,
			genres{
				name,
				group
			}
		}
	}
`;

export class GenresQuery extends Query<IGetGenreData, IGetGenreVariables>{ }