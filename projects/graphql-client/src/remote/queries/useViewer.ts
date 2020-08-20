import gql from "graphql-tag"
import { Share, shareKeys } from "@musicshare/shared-types"
import { useMemoizedResult } from "../../utils/useMemoizedResult"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"

export interface IGetViewerData {
	viewer: {
		id: string
		name: string
		shares: Share[]
	}
}

export const GET_VIEWER = gql`
  query user {
    viewer {
	  id
	  name
      shares {
        ${shareKeys}
      }
    }
  }
`

export const useViewer = (opts?: IUseQueryOptions<IGetViewerData>) => {
	const query = useGraphQLQuery<IGetViewerData, {}>(GET_VIEWER)

	return useMemoizedResult(query, (data) => data.viewer)
}
