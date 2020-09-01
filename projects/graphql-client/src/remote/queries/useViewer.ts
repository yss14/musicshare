import gql from "graphql-tag"
import { Share, shareKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetViewerData {
	viewer: {
		id: string
		name: string
		shares: Share[]
	}
}

export const GET_VIEWER = TransformedGraphQLQuery<IGetViewerData>(gql`
  query viewer {
    viewer {
	  id
	  name
      shares {
        ${shareKeys}
      }
    }
  }
`)((data) => data.viewer)

export const useViewer = (opts?: IGraphQLQueryOpts<typeof GET_VIEWER>) => {
	const query = useGraphQLQuery(GET_VIEWER, opts)

	return query
}
