import { IGenre } from "../types";
import gql from "graphql-tag";
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

export const useGenres = (shareID: string) =>
	useQuery<IGetGenreData, IGetGenreVariables>(GET_GENRES, { variables: { shareID } });