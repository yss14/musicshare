import { IShareSong, shareSongKeys } from "../types";
import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import { flatten, uniqBy } from 'lodash'
import { makeScopedSongs } from "../utils/data-transformations";

export interface IGetMergedSongsData {
	viewer: {
		id: string;
		__typename: 'User';
		shares: {
			id: string;
			__typename: 'Share';
			songs: IShareSong[];
		}[];
	}
}

export const GET_MERGED_SONGS = gql`
	query getMergedSongs{
		viewer{
			id
			shares{
				id
				songs{
					${shareSongKeys}
				}
			}
		}
	}
`

export const useMergedSongs = () => {
	const { data, ...rest } = useQuery<IGetMergedSongsData, {}>(GET_MERGED_SONGS)

	const mergedData = data
		?
		uniqBy(
			flatten(
				data.viewer.shares
					.map(share => makeScopedSongs(share.songs, share.id))

			),
			song => song.id
		)
		: undefined

	return { data: mergedData, ...rest }
}