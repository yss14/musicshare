import { Artist } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"

export interface IGetArtistsData {
	viewer: {
		artists: Artist[]
	}
}

export const GET_ARTISTS = gql`
	query Artists {
		viewer {
			id
			artists {
				name
			}
		}
	}
`

export const useArtists = (opts?: IUseQueryOptions<IGetArtistsData>) => {
	const { data, ...rest } = useGraphQLQuery<IGetArtistsData>(GET_ARTISTS, { staleTime: 30e3, ...opts })

	return {
		data: data ? data.viewer.artists : undefined,
		...rest,
	}
}
