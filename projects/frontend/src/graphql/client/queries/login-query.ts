import gql from "graphql-tag"
import { useQuery } from "@apollo/client"

export interface ILoggedInData {
	loggedIn: boolean
}

export const GET_LOGGED_IN = gql`
	query {
		loggedIn @client
	}
`

export const useLoggedIn = () => useQuery<ILoggedInData, {}>(GET_LOGGED_IN)
