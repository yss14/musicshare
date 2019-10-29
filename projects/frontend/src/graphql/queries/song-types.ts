import { ISongType } from "../types";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IGetSongTypesData {
	share: {
		songTypes: ISongType[];
	}
}

export interface IGetSongTypesVariables {
	shareID: string;
}

export const GET_SONGTYPES = gql`
	query genres($shareID: String!){
		share(shareID: $shareID) {
			id,
			songTypes{
				name,
				group,
				hasArtists,
				alternativeNames
			}
		}
	}
`;

export const useSongTypes = (shareID: string) =>
	useQuery<IGetSongTypesData, IGetSongTypesVariables>(GET_SONGTYPES, { variables: { shareID } });