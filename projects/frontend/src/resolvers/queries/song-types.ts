import { ISongType } from "../types";
import gql from "graphql-tag";
import { Query } from "react-apollo";

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