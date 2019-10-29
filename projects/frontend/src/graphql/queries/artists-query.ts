import { IArtist } from "../types";
import gql from "graphql-tag";
import { Query, QueryResult } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

export interface IGetArtistsData {
	share: {
		artists: IArtist[];
	}
}

export interface IGetArtistsVariables {
	shareID: string;
}

export const GET_ARTISTS = gql`
	query genres($shareID: String!){
		share(shareID: $shareID) {
			id,
			artists{
				name
			}
		}
	}
`;

export const useArtists = (shareID: string) =>
	useQuery<IGetArtistsData, IGetArtistsVariables>(GET_ARTISTS, { variables: { shareID } });