import { useApolloClient } from "@apollo/client"
import { GET_LIBRARY_ID, ILibraryIDData } from "../queries/libraryid-query"

export const useUpdateLibraryID = () => {
	const client = useApolloClient()

	return (libraryID: string | null) => {
		client.writeQuery<ILibraryIDData, {}>({
			query: GET_LIBRARY_ID,
			data: {
				libraryID,
			},
		})
	}
}
