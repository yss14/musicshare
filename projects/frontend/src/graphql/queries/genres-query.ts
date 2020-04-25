import { IGenre } from "../types"
import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"

export interface IGetGenreData {
	viewer: {
		genres: IGenre[]
	}
}

export const GET_GENRES = gql`
	query genres {
		viewer {
			id
			genres {
				name
				group
			}
		}
	}
`

export const useGenres = () => {
	const { data, ...rest } = useQuery<IGetGenreData>(GET_GENRES)

	return {
		data: data ? data.viewer.genres : undefined,
		...rest,
	}
}
