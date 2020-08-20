import { Artist } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IGetArtistsData {
	viewer: {
		artists: Artist[]
	}
}

export const GET_ARTISTS = gql`
	query artists {
		viewer {
			id
			artists {
				name
			}
		}
	}
`

export const useArtists = (opts?: IUseQueryOptions<IGetArtistsData>) => {
	const query = useGraphQLQuery<IGetArtistsData>(GET_ARTISTS, { staleTime: 30e3, ...opts })

	return useMemoizedResult(query, (data) => data.viewer.artists)
}
