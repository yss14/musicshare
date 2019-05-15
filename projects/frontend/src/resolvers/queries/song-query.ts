import React from "react";
import { IShareSong } from "../types";
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
				id
				title
				suffix
				year
				bpm
				dateLastEdit
				releaseDate
				isRip
				artists
				remixer
				featurings
				type
				genres
				label
				requiresUserAction,
				tags
			}
    	}
  	}
`;

export class SongQuery extends Query<ISongData, ISongVariables>{ }

export const useSong = ({ variables }: { variables: ISongVariables }): QueryResult<ISongData, ISongVariables> => useQuery(GET_SONG);