import { ISongType } from "../types"
import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"

export interface IGetSongTypesData {
	viewer: {
		songTypes: ISongType[]
	}
}

export const GET_SONGTYPES = gql`
	query genres {
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

export const useSongTypes = () => {
	const { data, ...rest } = useQuery<IGetSongTypesData>(GET_SONGTYPES)

	return {
		data: data ? data.viewer.songTypes : undefined,
		...rest,
	}
}
