import { Artist } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetArtistsData {
	viewer: {
		artists: Artist[]
	}
}

export const GET_ARTISTS = TransformedGraphQLQuery<IGetArtistsData>(gql`
	query artists {
		viewer {
			id
			artists {
				name
			}
		}
	}
`)((data) => data.viewer.artists)

export const useArtists = (opts?: IGraphQLQueryOpts<typeof GET_ARTISTS>) => {
	const query = useGraphQLQuery(GET_ARTISTS, { staleTime: 30e3, ...opts })

	return query
}
