import React, { useCallback, useState, useRef } from "react"
import { IPlaylist, IScopedSong, isPlaylistSong } from "../../graphql/types"
import { usePlayerActions, usePlayerQueue } from "../../player/player-hook"
import { ContextMenu } from "../../components/modals/contextmenu/ContextMenu"
import { Menu, message } from "antd"
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist"
import { PlaylistPicker } from "../../components/modals/playlist-picker/PlaylistPicker"
import { useLibraryID } from "../../graphql/client/queries/libraryid-query"
import { useRemoveSongFromLibrary } from "../../graphql/mutations/remove-song-from-library-mutation"
import { useRemoveSongsFromPlaylist } from "../../graphql/mutations/remove-songs-from-playlist-mutation"
import { buildSongName } from "../../utils/songname-builder"

export interface ISongContextMenuEvents {
	onShowInformation: (song: IScopedSong) => void
}

interface ISongContextMenuProps {
	song: IScopedSong | null
	playlistID?: string
	events: ISongContextMenuEvents
}

export const SongContextMenu = React.forwardRef<HTMLDivElement, ISongContextMenuProps>((props, ref) => {
	const { song, playlistID, events } = props
	const { onShowInformation } = events
	const [showPickPlaylistModal, setShowPickPlaylistModal] = useState(false)
	const { changeSong } = usePlayerActions()
	const { enqueueSong, enqueueSongNext } = usePlayerQueue()
	const addSongsToPlaylist = useAddSongsToPlaylist()
	const mutatingSong = useRef<typeof song>(null)

	const [removeSongFromLibrary] = useRemoveSongFromLibrary({
		onCompleted: () =>
			message.success(`Song ${buildSongName(mutatingSong.current!)} successfully removed from library`),
	})

	const [removeSongsFromPlaylist] = useRemoveSongsFromPlaylist({
		onCompleted: () =>
			message.success(`Song ${buildSongName(mutatingSong.current!)} successfully removed from playlist`),
	})

	const userLibraryID = useLibraryID()

	const onClickPlayNow = useCallback(() => {
		if (!song) return

		changeSong(song)
	}, [song, changeSong])

	const onClickPlayNext = useCallback(() => {
		if (!song) return

		enqueueSongNext(song)
	}, [song, enqueueSongNext])

	const onClickPlayLater = useCallback(() => {
		if (!song) return

		enqueueSong(song)
	}, [song, enqueueSong])

	const onClickAddSongToPlaylist = useCallback(() => {
		if (!song) return

		setShowPickPlaylistModal(true)
	}, [song, setShowPickPlaylistModal])

	const onSubmitPickPlaylists = useCallback(
		(playlists: IPlaylist[]) => {
			if (!song) return

			setShowPickPlaylistModal(false)

			playlists.map((playlist) => addSongsToPlaylist(playlist.shareID, playlist.id, [song.id]))
		},
		[song, setShowPickPlaylistModal, addSongsToPlaylist],
	)

	const onRemoveFromLibrary = useCallback(async () => {
		if (!song) return

		mutatingSong.current = song

		if (playlistID && isPlaylistSong(song) && song.shareID === userLibraryID) {
			await removeSongsFromPlaylist(song.shareID, playlistID, [song.playlistSongID])
		}

		await removeSongFromLibrary(song.libraryID, song.id)
	}, [song, removeSongFromLibrary, playlistID, removeSongsFromPlaylist, userLibraryID])

	const onRemoveFromPlaylist = useCallback(() => {
		if (!song || !playlistID || !isPlaylistSong(song)) return

		mutatingSong.current = song
		removeSongsFromPlaylist(song.shareID, playlistID, [song.playlistSongID])
	}, [song, playlistID, removeSongsFromPlaylist])

	return (
		<>
			<ContextMenu ref={ref}>
				<Menu>
					<Menu.Item key="information" onClick={() => onShowInformation(song!)}>
						Information
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item key="playnow" onClick={onClickPlayNow}>
						Play now
					</Menu.Item>
					<Menu.Item key="playnext" onClick={onClickPlayNext}>
						Play next
					</Menu.Item>
					<Menu.Item key="playlater" onClick={onClickPlayLater}>
						Play later
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item key="addtoplaylist" onClick={onClickAddSongToPlaylist}>
						Add to playlist
					</Menu.Item>
					<Menu.Divider />
					{song && song.libraryID === userLibraryID && (
						<Menu.Item key="removefromlibrary" onClick={onRemoveFromLibrary}>
							Remove from library
						</Menu.Item>
					)}
					{playlistID && (
						<Menu.Item key="removefromplaylist" onClick={onRemoveFromPlaylist}>
							Remove from playlist
						</Menu.Item>
					)}
				</Menu>
			</ContextMenu>
			<PlaylistPicker visible={showPickPlaylistModal} onSubmit={onSubmitPickPlaylists} />
		</>
	)
})
