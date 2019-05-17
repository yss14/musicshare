import { IGenre } from "../types";
import gql from "graphql-tag";
import { Query, QueryResult } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

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

export const useGenres = ({ variables }: { variables: IGetGenreVariables }): QueryResult<IGetGenreData, IGetGenreVariables> => useQuery(GET_GENRES);