import { useApolloClient } from "react-apollo"
import { useMemo, useCallback } from "react"
import { getSongMediaUrls } from "../graphql/programmatic/get-song-mediaurl"
import { IScopedSong, IBaseSongPlayable } from "../graphql/types"
import { makeIncrementSongPlayCount } from "../graphql/programmatic/increment-song-playcount"

export const useSongUtils = () => {
	const apolloClient = useApolloClient()
	const fetchSongMediaURL = useMemo(() => getSongMediaUrls(apolloClient), [apolloClient])
	const incrementSongPlayCount = useMemo(() => makeIncrementSongPlayCount(apolloClient), [apolloClient])

	const makePlayableSong = useCallback(
		(song: IScopedSong): IBaseSongPlayable => ({
			...song,
			getMediaURL: () => fetchSongMediaURL(song.shareID, song.id),
			incrementSongPlayCount: () => incrementSongPlayCount(song.id, song.shareID),
		}),
		[incrementSongPlayCount, fetchSongMediaURL],
	)

	return { makePlayableSong }
}
