import gql from "graphql-tag"
import { useGraphQLMutation, TransformedGraphQLMutation, IGraphQLMutationOpts } from "../../react-query-graphql"

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

export const GET_SONG_MEDIAURL = TransformedGraphQLMutation<IGetSongMediaURLData, IGetSongMediaURLVariables>(gql`
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
`)((data) => data.share.song.sources)

export const useSongMediaUrl = (opts?: IGraphQLMutationOpts<typeof GET_SONG_MEDIAURL>) => {
	const mutation = useGraphQLMutation(GET_SONG_MEDIAURL, opts)

	return mutation
}
