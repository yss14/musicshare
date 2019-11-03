import { useApolloClient } from "@apollo/react-hooks";
import { useEffect } from "react";

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
