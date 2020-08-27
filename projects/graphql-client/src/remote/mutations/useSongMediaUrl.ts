import gql from "graphql-tag"
import { useGraphQLMutation, IUseMutationOptions } from "../../react-query-graphql"

export interface ISongMediaUrl {
	__typename: string
	accessUrl: string
}

export interface IGetSongMediaURLData {
	share: {
		song: {
			sources: ISongMediaUrl[]
		}
	}
}

export interface IGetSongMediaURLVariables {
	shareID: string
	songID: string
}

export const GET_SONG_MEDIAURL = gql`
	query song($shareID: String!, $songID: String!) {
		share(shareID: $shareID) {
			id
			song(id: $songID) {
				id
				sources {
					__typename
					... on FileUpload {
						accessUrl
					}
				}
			}
		}
	}
`

export const useSongMediaUrl = (opts?: IUseMutationOptions<IGetSongMediaURLData, IGetSongMediaURLVariables>) => {
	const mutation = useGraphQLMutation<IGetSongMediaURLData, IGetSongMediaURLVariables>(GET_SONG_MEDIAURL, opts)

	return mutation
}
