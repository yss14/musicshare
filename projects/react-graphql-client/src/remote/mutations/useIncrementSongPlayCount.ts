import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

export interface IIncrementSongPlayCountData {
	incrementSongPlayCount: {
		user: {
			id: string
		}
		song: {
			id: string
		}
		dateAdded: string
	}
}

export interface IIncrementSongPlayCountVariables {
	input: {
		songID: string
		shareID: string
	}
}

export const INCREMENT_SONG_PLAYCOUNT = TransformedGraphQLMutation<
	IIncrementSongPlayCountData,
	IIncrementSongPlayCountVariables
>(gql`
	mutation IncrementSongPlayCount($input: IncrementSongPlayCountInput!) {
		incrementSongPlayCount(input: $input) {
			user {
				id
			}
			song {
				id
			}
			dateAdded
		}
	}
`)((data) => data.incrementSongPlayCount)

export const useIncrementSongPlayCount = (opts?: IGraphQLMutationOpts<typeof INCREMENT_SONG_PLAYCOUNT>) => {
	const mutation = useGraphQLMutation(INCREMENT_SONG_PLAYCOUNT, opts)

	return mutation
}
