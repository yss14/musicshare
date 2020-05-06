import gql from "graphql-tag"
import ApolloClient from "apollo-client"
import { IBaseSong, shareSongKeys } from "../types"

interface IFindSongFileDuplicatesData {
	viewer: {
		id: string
		findSongFileDuplicates: IBaseSong[]
	}
}

interface IFindSongFileDuplicatesVariables {
	hash: string
}

const FIND_SONG_FILE_DUPLICATES = gql`
	query FindSongFileDuplicates($hash: String!) {
		viewer {
			id
			findSongFileDuplicates(hash: $hash) {
				${shareSongKeys}
			}
		}
	}
`

export type GenerateUploadableUrl = (fileExtension: string) => Promise<string>

export const findSongFileDuplicates = async (client: ApolloClient<unknown>, hash: string) => {
	const response = await client.query<IFindSongFileDuplicatesData, IFindSongFileDuplicatesVariables>({
		query: FIND_SONG_FILE_DUPLICATES,
		variables: { hash },
		fetchPolicy: "network-only",
	})

	if (response.data) {
		return response.data.viewer.findSongFileDuplicates
	} else {
		throw new Error("Cannot find song file duplicates")
	}
}
