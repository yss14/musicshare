import { useApolloClient } from "@apollo/react-hooks";

export const useUpdateplaylistID = () => {
	const client = useApolloClient()

	return (playlistID: string | null) => {
		client.writeData({
			data: {
				playlistID
			}
		})
	}
}
