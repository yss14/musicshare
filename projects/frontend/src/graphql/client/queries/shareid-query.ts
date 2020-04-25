import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"

export interface IShareIDData {
	shareID: string
}

export const GET_SHARE_ID = gql`
	query {
		shareID @client
	}
`

export const useShareID = () => {
	const { data } = useQuery<IShareIDData, {}>(GET_SHARE_ID)

	return data!.shareID
}
