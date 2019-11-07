import gql from "graphql-tag";

export interface ISongMediaUrl {
	__typename: string;
	accessUrl: string;
}

export interface ISongMediaURLData {
	share: {
		song: {
			sources: ISongMediaUrl[];
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
				sources {
					__typename
            		... on FileUpload{
						accessUrl
					}
				}
			}
		}
	}
`;