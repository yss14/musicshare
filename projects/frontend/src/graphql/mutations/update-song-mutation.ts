import gql from "graphql-tag"
import { Nullable } from "../../types/Nullable"
import { shareSongKeys } from "../types"
import { useMemo } from "react"
import { useMutation, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { IShareSong } from "@musicshare/shared-types"
import { queryCache } from "react-query"
import { getQueryKey, GET_PLAYLIST_WITH_SONGS } from "@musicshare/graphql-client"

export const UPDATE_SONG = gql`
	mutation UpdateSong($shareID: String!, $songID: String!, $song: SongUpdateInput!){
		updateSong(shareID: $shareID, songID: $songID, song: $song){
			${shareSongKeys}
		}
	}
`

export interface ISongUpdateInput {
	title?: string
	suffix?: string
	year?: number
	bpm?: number
	releaseDate?: string
	isRip?: boolean
	artists?: string[]
	remixer?: string[]
	featurings?: string[]
	type?: string
	genres?: string[]
	label?: string
	tags?: string[]
}

export interface IUpdateSongVariables {
	shareID: string
	songID: string
	song: Nullable<ISongUpdateInput>
}

export interface IUpdateSongData {
	updateSong: IShareSong
}

const makeUpdateSongCache = (shareID: string, playlistID?: string): MutationUpdaterFn<IUpdateSongData> => (
	cache,
	{ data },
) => {
	if (data) {
		/*addArtistsToCache(
			cache,
			data.updateSong.artists
				.concat(data.updateSong.remixer)
				.concat(data.updateSong.featurings)
				.map((artist) => ({ name: artist })),
		)*/
	}

	queryCache.invalidateQueries([getQueryKey(GET_PLAYLIST_WITH_SONGS.query), { shareID, playlistID }])
}

export const useUpdateSongMutation = (
	song: IShareSong,
	playlistID?: string,
	opts?: MutationHookOptions<IUpdateSongData, IUpdateSongVariables>,
) => {
	const updateSongCache = useMemo(() => makeUpdateSongCache(song.shareID, playlistID), [song.shareID, playlistID])

	const mutation = useMutation(UPDATE_SONG, { ...opts, update: updateSongCache })

	return mutation
}
