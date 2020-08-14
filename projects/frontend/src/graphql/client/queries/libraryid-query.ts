import gql from "graphql-tag"
import { useQuery } from "@apollo/client"

export interface ILibraryIDData {
	libraryID: string | null
}

export const GET_LIBRARY_ID = gql`
	query {
		libraryID @client
	}
`

export const useLibraryID = () => {
	const { data } = useQuery<ILibraryIDData, {}>(GET_LIBRARY_ID)

	return data ? data.libraryID : null
}
