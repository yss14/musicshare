//import { Artist } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery } from "../../react-query-graphql"

export interface IGetArtistsData {
	viewer: {
		artists: any[]
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

export const useArtists = () => {
	const { data, ...rest } = useGraphQLQuery<IGetArtistsData>(GET_ARTISTS)
	console.log(data)
	return {
		data: data ? data.viewer.artists : undefined,
		...rest,
	}
}
