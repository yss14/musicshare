import React, { useCallback, useState } from "react"
import { ISharePlaylistRoute } from "../../interfaces"
import { usePlaylist } from "../../graphql/queries/playlist-songs"
import { useParams } from "react-router-dom"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { isPlaylistSong, IScopedPlaylistSong } from "../../graphql/types"
import { useUpdatePlaylistSongOrder } from "../../graphql/mutations/update-playlist-song-order"
import { useDeepCompareEffect } from "../../hooks/use-deep-compare-effect"
import { MoveSong } from "../../components/song-table/MoveSong"
import { SongTableColumn } from "../../components/song-table/song-table-columns"

export interface IPlaylistSongsProps {
	shareID: string
}

export const PlaylistSongs = ({ shareID }: IPlaylistSongsProps) => {
	const { playlistID } = useParams<ISharePlaylistRoute>()
	const { loading, data: playlist, error } = usePlaylist({ playlistID, shareID })
	const [songs, setSongs] = useState<IScopedPlaylistSong[]>(playlist?.songs || [])
	const [updateOrder] = useUpdatePlaylistSongOrder({
		onCompleted: (data) => {
			setSongs(data.updateOrderOfPlaylist)
		},
		onError: console.error,
	})

	const moveSong = useCallback<MoveSong>(
		(sourceSong, targetSong) => {
			if (!songs || !playlist || !isPlaylistSong(sourceSong) || !isPlaylistSong(targetSong)) return
			if (sourceSong.playlistSongID === targetSong.playlistSongID) return

			const newSongs = songs.concat([])

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
			columns={[
				SongTableColumn.Position,
				SongTableColumn.Title,
				SongTableColumn.Time,
				SongTableColumn.Artists,
				SongTableColumn.Genres,
			]}
		/>
	)
}
