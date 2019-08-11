import gql from "graphql-tag";

export interface ISongMediaURLData {
	share: {
		song: {
			accessUrl: string;
		};
	}
}

export interface ISongMediaURLVariables {
	shareID: string;
	songID: string;
}

export const GET_SONG_MEDIAURL = gql`
	query song ($shareID: String!, $songID: String!){
		share(shareID: $shareID) {
			id,
      		song(id: $songID){
				id,
				accessUrl,
			}
    	}
  	}
`;