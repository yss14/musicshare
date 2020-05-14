import { shareSongKeys } from "../types"
import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"
import { IShareSong } from "@musicshare/shared-types"

export interface ISongData {
	share: {
		song: IShareSong
	}
}

export interface ISongVariables {
	shareID: string
	songID: string
}

export const GET_SONG = gql`
	query song ($shareID: String!, $songID: String!){
		share(shareID: $shareID) {
			id,
      		song(id: $songID){
				${shareSongKeys}
			}
    	}
  	}
`

export const useSong = (shareID: string, songID: string) => {
	const { data, ...rest } = useQuery<ISongData, ISongVariables>(GET_SONG, { variables: { shareID, songID } })

	return {
		data: data ? data.share.song : undefined,
		...rest,
	}
}
