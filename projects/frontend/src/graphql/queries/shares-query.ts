import gql from "graphql-tag"
import { IShare, shareKeys } from "../types"
import { useQuery } from "@apollo/client"

export interface IGetSharesData {
	viewer: {
		id: string
		__typename: "User"
		shares: IShare[]
	}
}

export interface IGetSharesVariables {}

export const GET_SHARES = gql`
  query user {
    viewer {
      id
      shares {
        ${shareKeys}
      }
    }
  }
`

export const useShares = () => useQuery<IGetSharesData, IGetSharesVariables>(GET_SHARES)
