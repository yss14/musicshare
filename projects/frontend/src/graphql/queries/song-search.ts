import { shareSongKeys, IScopedSong } from "../types";
import gql from "graphql-tag";
import { useLazyQuery } from "react-apollo";
import { useCallback, useState } from "react";
import { makeScopedSong } from "../utils/data-transformations";

export interface ISongSearchData {
	viewer: {
		searchSongs: IScopedSong[];
	}
}

export interface ISongSearchVariables {
	query: string;
	matcher?: string[];
	limit?: number;
}

export const SEARCH_SONG = gql`
	query searchSongs($query: String!, $matcher: [SongSearchMatcher!], $limit: Int = 20) {
		viewer {
			id
			searchSongs(query: $query, matcher: $matcher, limit: $limit){
				${shareSongKeys}
			}
		}
	}
`

export const useSongSearch = () => {
	const [cachedData, setCachedData] = useState<ISongSearchData | null>(null)
	const [searchSong, { data, ...rest }] = useLazyQuery<ISongSearchData, ISongSearchVariables>(SEARCH_SONG, {
		fetchPolicy: 'cache-and-network',
		onCompleted: (data) => setCachedData(data)
	})

	const search = useCallback((query: string, matcher?: string[], limit?: number) => {
		searchSong({ variables: { query, matcher, limit } })
	}, [searchSong])

	return {
		data: cachedData ? cachedData.viewer.searchSongs.map(song => makeScopedSong(song, song.libraryID)) : undefined,
		search,
		...rest,
	}
}