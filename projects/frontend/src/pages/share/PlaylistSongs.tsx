import React, { useCallback, useState } from "react"
import { ISharePlaylistRoute } from "../../interfaces"
import { usePlaylist } from "../../graphql/queries/playlist-songs"
import { useParams } from "react-router-dom"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { isPlaylistSong } from "../../graphql/types"
import { useUpdatePlaylistSongOrder } from "../../graphql/mutations/update-playlist-song-order"
import { useDeepCompareEffect } from "../../hooks/use-deep-compare-effect"
import { MoveSong } from "../../components/song-table/MoveSong"
import { useSongUploadQueueEvents, ISongUploadItem } from "../../utils/upload/SongUploadContext"
import { useDebouncedCallback } from "use-debounce/lib"
import { IPlaylistSong } from "@musicshare/shared-types"

export interface IPlaylistSongsProps {
	shareID: string
}

export const PlaylistSongs = ({ shareID }: IPlaylistSongsProps) => {
	const { playlistID } = useParams<ISharePlaylistRoute>()
	const { loading, data: playlist, error, refetch } = usePlaylist({ playlistID, shareID })
	const [songs, setSongs] = useState<IPlaylistSong[]>(playlist?.songs || [])
	const [updateOrder] = useUpdatePlaylistSongOrder({
		onError: console.error,
	})

	const [refetchPlaylist] = useDebouncedCallback(refetch, 1000)

	const onPlaylistSongUploaded = useCallback(
		(item: ISongUploadItem) => {
			if (item.playlistIDs && item.playlistIDs.includes(playlistID)) {
				refetchPlaylist()
			}
		},
		[refetchPlaylist, playlistID],
	)

	useSongUploadQueueEvents({
		onSongUploaded: onPlaylistSongUploaded,
	})

	const moveSong = useCallback<MoveSong>(
		(sourceSong, targetSong) => {
			if (!songs || !playlist || !isPlaylistSong(sourceSong) || !isPlaylistSong(targetSong)) return
			if (sourceSong.playlistSongID === targetSong.playlistSongID) return

			const newSongs = [...songs]

			const sourceSongIdx = newSongs.findIndex((song) => song.playlistSongID === sourceSong.playlistSongID)
			const targetSongIdx = newSongs.findIndex((song) => song.playlistSongID === targetSong.playlistSongID)

			newSongs.splice(targetSongIdx, 0, newSongs.splice(sourceSongIdx, 1)[0])

			setSongs(newSongs)

			updateOrder(
				shareID,
				playlist.id,
				newSongs.map((song, idx) => [song.playlistSongID, idx]),
			)
		},
		[setSongs, songs, playlist, updateOrder, shareID],
	)

	useDeepCompareEffect(() => {
		if (playlist?.songs) {
			setSongs(playlist.songs)
		}
	}, [playlist?.songs])

	if (loading) return <LoadingSpinner />
	if (error) return <div>{error.message}</div>
	if (!playlist || !songs) return <div>No data</div>

	return (
		<MainSongsView
			title={playlist.name}
			songs={songs}
			playlistID={playlist.id}
			moveSong={moveSong}
			isMergedView={false}
		/>
	)
}
