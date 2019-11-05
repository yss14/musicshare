import { IShareSong, shareSongKeys } from "../types";
import gql from "graphql-tag";
import { useQuery } from "react-apollo";
import { flatten } from 'lodash'

export interface IGetMergedSongsData {
	user: {
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
		user{
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
		flatten(
			data.user.shares
				.map(share => share.songs)

		)
		: undefined

	return { data: mergedData, ...rest }
}