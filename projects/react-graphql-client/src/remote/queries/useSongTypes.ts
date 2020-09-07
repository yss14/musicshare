import { SongType } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetSongTypesData {
	viewer: {
		songTypes: SongType[]
	}
}

export const GET_SONGTYPES = TransformedGraphQLQuery<IGetSongTypesData>(gql`
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
`)((data) => data.viewer.songTypes)

export const useSongTypes = (opts?: IGraphQLQueryOpts<typeof GET_SONGTYPES>) => {
	const query = useGraphQLQuery(GET_SONGTYPES, { staleTime: 30e3, ...opts })

	return query
}
