import { IArtist } from "../types";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

export interface IGetArtistsData {
	viewer: {
		artists: IArtist[];
	}
}

export const GET_ARTISTS = gql`
	query genres {
		viewer {
			id,
			artists{
				name
			}
		}
	}
`;

export const useArtists = () => {
	const { data, ...rest } = useQuery<IGetArtistsData>(GET_ARTISTS)

	return {
		data: data ? data.viewer.artists : undefined,
		...rest,
	}
}
