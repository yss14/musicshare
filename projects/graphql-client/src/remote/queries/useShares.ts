import gql from "graphql-tag"
import { Share, shareKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IGetSharesData {
	viewer: {
		id: string
		shares: Share[]
	}
}

export const GET_SHARES = gql`
  query shares {
    viewer {
      id
      shares {
        ${shareKeys}
      }
    }
  }
`

export const useShares = (opts?: IUseQueryOptions<IGetSharesData>) => {
	const query = useGraphQLQuery<IGetSharesData>(GET_SHARES, opts)

	return useMemoizedResult(query, (data) => data.viewer.shares)
}
