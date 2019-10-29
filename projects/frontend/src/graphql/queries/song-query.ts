import { IShareSong, shareSongKeys } from "../types";
import { Query, QueryResult } from "react-apollo";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface ISongData {
	share: {
		song: IShareSong;
	}
}

export interface ISongVariables {
	shareID: string;
	songID: string;
}

export const GET_SONG = gql`
	query song ($shareID: String!, $songID: String!){
		share(shareID: $shareID) {
			id,
      		song(id: $songID){
				${shareSongKeys}
			}
    	}
  	}
`;

export class SongQuery extends Query<ISongData, ISongVariables>{ }

export const useSong = ({ variables }: { variables: ISongVariables }) => useQuery<ISongData, ISongVariables>(GET_SONG);