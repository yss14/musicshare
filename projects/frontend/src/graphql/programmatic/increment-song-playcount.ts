import gql from "graphql-tag"
import { ApolloClient } from "@apollo/client"

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

interface IIncrementSongPlayCountVariables {
	input: {
		songID: string
		shareID: string
	}
}

const INCREMENT_SONG_PLAYCOUNT = gql`
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
`

export const makeIncrementSongPlayCount = (client: ApolloClient<unknown>) => async (
	songID: string,
	shareID: string,
) => {
	const response = await client.mutate<IIncrementSongPlayCountData, IIncrementSongPlayCountVariables>({
		mutation: INCREMENT_SONG_PLAYCOUNT,
		variables: {
			input: {
				songID,
				shareID,
			},
		},
	})

	return response.data!
}
