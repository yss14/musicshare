import { useApolloClient } from "@apollo/client"
import { useEffect } from "react"
import { GET_SHARE_ID, IShareIDData } from "../queries/shareid-query"

export const useUpdateShareID = (shareID: string | null) => {
	const client = useApolloClient()

	useEffect(() => {
		client.writeQuery<IShareIDData>({
			query: GET_SHARE_ID,
			data: {
				shareID,
			},
		})
	}, [shareID, client])
}
