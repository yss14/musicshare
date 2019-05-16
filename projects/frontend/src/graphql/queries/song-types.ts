import { ISongType } from "../types";
import gql from "graphql-tag";
import { Query, QueryResult } from "react-apollo";
import { GET_SONG } from "./song-query";
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

export class SongTypesQuery extends Query<IGetSongTypesData, IGetSongTypesVariables>{ }

export const useSongTypes = ({ variables }: { variables: IGetSongTypesVariables }): QueryResult<IGetSongTypesData, IGetSongTypesVariables> => useQuery(GET_SONG);