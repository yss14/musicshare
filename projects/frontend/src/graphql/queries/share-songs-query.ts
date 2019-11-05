import gql from "graphql-tag";
import { shareSongKeys, IShareSong } from "../types";
import { useQuery } from "@apollo/react-hooks";
import { useHistory } from "react-router-dom";
import { defaultGraphQLErrorHandler } from "../utils/default-graphql-errorhandler";

export interface IGetShareWithSongsData {
	share: {
		id: string;
		name: string;
		songs: IShareSong[];
	}
}

export interface IGetShareWithSongsVariables {
	shareID: string;
}

export const GET_SHARE_WITH_SONGS = gql`
  query share($shareID: String!) {
    share(shareID: $shareID) {
      id
      name
      songs {
        ${shareSongKeys}
      }
    }
  }
`;

export const useShareSongs = (shareID: string) => {
	const history = useHistory()

	const { data, ...rest } = useQuery<IGetShareWithSongsData, IGetShareWithSongsVariables>(
		GET_SHARE_WITH_SONGS,
		{
			variables: {
				shareID
			},
			onError: defaultGraphQLErrorHandler(history),
		}
	)

	return {
		data: data ? data.share.songs : undefined,
		...rest
	}
}