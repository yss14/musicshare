import { SongType } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

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
	const query = useGraphQLQuery<IGetSongTypesData>(GET_SONGTYPES, { staleTime: 30e3, ...opts })

	return useMemoizedResult(query, (data) => data.viewer.songTypes)
}
