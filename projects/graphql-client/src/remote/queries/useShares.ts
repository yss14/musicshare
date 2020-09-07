import gql from "graphql-tag"
import { Share, shareKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetSharesData {
	viewer: {
		id: string
		shares: Share[]
	}
}

export const GET_SHARES = TransformedGraphQLQuery<IGetSharesData>(gql`
  query shares {
    viewer {
      id
      shares {
        ${shareKeys}
      }
    }
  }
`)((data) => data.viewer.shares)

export const useShares = (opts?: IGraphQLQueryOpts<typeof GET_SHARES>) => {
	const query = useGraphQLQuery(GET_SHARES, opts)

	return query
}
