import { IShareSong, shareSongKeys } from "../types";
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

export const useSong = (shareID: string, songID: string) =>
	useQuery<ISongData, ISongVariables>(GET_SONG, { variables: { shareID, songID } });