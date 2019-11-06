import { useApolloClient } from "@apollo/react-hooks";

export const useUpdateLibraryID = () => {
	const client = useApolloClient()

	return (libraryID: string | null) => {
		client.writeData({
			data: {
				libraryID
			}
		})
	}
}
