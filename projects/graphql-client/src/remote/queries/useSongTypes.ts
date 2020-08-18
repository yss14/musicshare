import { SongType } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"

export interface IGetSongTypesData {
	viewer: {
		songTypes: SongType[]
	}
}

export const GET_SONGTYPES = gql`
	query songtypes {
		viewer {
			id
			songTypes {
				name
				group
				hasArtists
				alternativeNames
			}
		}
	}
`

export const useSongTypes = (opts?: IUseQueryOptions<IGetSongTypesData>) => {
	const { data, ...rest } = useGraphQLQuery<IGetSongTypesData>(GET_SONGTYPES, { staleTime: 30e3, ...opts })

	return {
		data: data ? data.viewer.songTypes : undefined,
		...rest,
	}
}
