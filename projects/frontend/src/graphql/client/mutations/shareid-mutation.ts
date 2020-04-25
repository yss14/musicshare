import gql from "graphql-tag"
import { useMutation } from "@apollo/react-hooks"
import { useEffect } from "react"

export interface IUpdateShareIDVariables {
	shareID: string | null
}

const UPDATE_SHARE_ID = gql`
	mutation updateShareId($shareID: String!) {
		updateShareId(shareID: $shareID) @client
	}
`

export const useUpdateShareID = (shareID: string | null) => {
	const [updateShareID] = useMutation<{}, IUpdateShareIDVariables>(UPDATE_SHARE_ID)

	useEffect(() => {
		updateShareID({
			variables: {
				shareID,
			},
		})
	}, [shareID, updateShareID])

	return updateShareID
}
