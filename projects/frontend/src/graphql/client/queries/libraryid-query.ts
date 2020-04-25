import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"

export interface ILibraryIDData {
	libraryID: string
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
