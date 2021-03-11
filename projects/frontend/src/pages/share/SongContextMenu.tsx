import React, { useCallback, useState, useRef } from "react"
import { usePlayerActions, usePlayerQueue } from "../../player/player-hook"
import { ContextMenu, ContextMenuItem } from "../../components/modals/contextmenu/ContextMenu"
import { Menu, message } from "antd"
import { PlaylistPicker } from "../../components/modals/playlist-picker/PlaylistPicker"
import { buildSongName } from "../../utils/songname-builder"
import { ShareSong, Playlist, isPlaylistSong } from "@musicshare/shared-types"
import {
	useRemoveSongsFromPlaylist,
	useRemoveSongFromLibrary,
	useAddSongsToPlaylist,
} from "@musicshare/react-graphql-client"
import { useLibraryID } from "../../hooks/data/useLibraryID"

export interface ISongContextMenuEvents {
	onShowInformation: (song: ShareSong) => void
}

interface ISongContextMenuProps {
	song: ShareSong | null
	playlistID?: string
	events: ISongContextMenuEvents
	contextMenuVisible: boolean
}

export const SongContextMenu = React.forwardRef<HTMLDivElement, ISongContextMenuProps>((props, ref) => {
	const { song, playlistID, events, contextMenuVisible } = props
	const { onShowInformation } = events
	const [showPickPlaylistModal, setShowPickPlaylistModal] = useState(false)
	const { changeSong } = usePlayerActions()
	const { enqueueSong, enqueueSongNext } = usePlayerQueue()
	const { mutate: addSongsToPlaylist } = useAddSongsToPlaylist()
	const mutatingSong = useRef<typeof song>(null)

	const { mutate: removeSongFromLibrary } = useRemoveSongFromLibrary({
		onSuccess: () => {
			message.success(`Song ${buildSongName(mutatingSong.current!)} successfully removed from library`)
		},
	})

	const { mutate: removeSongsFromPlaylist } = useRemoveSongsFromPlaylist({
		onSuccess: () => {
			message.success(`Song ${buildSongName(mutatingSong.current!)} successfully removed from playlist`)
		},
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
		(playlists: Playlist[]) => {
			if (!song) return

			setShowPickPlaylistModal(false)

			playlists.map((playlist) =>
				addSongsToPlaylist({ shareID: playlist.shareID, playlistID: playlist.id, songIDs: [song.id] }),
			)
		},
		[song, setShowPickPlaylistModal, addSongsToPlaylist],
	)

	const onRemoveFromLibrary = useCallback(async () => {
		if (!song) return

		mutatingSong.current = song

		if (playlistID && isPlaylistSong(song) && song.shareID === userLibraryID) {
			await removeSongsFromPlaylist({ shareID: song.shareID, playlistID, playlistSongIDs: [song.playlistSongID] })
		}

		await removeSongFromLibrary({ input: { shareID: song.libraryID, songID: song.id } })
	}, [song, removeSongFromLibrary, playlistID, removeSongsFromPlaylist, userLibraryID])

	const onRemoveFromPlaylist = useCallback(() => {
		if (!song || !playlistID || !isPlaylistSong(song)) return

		mutatingSong.current = song
		removeSongsFromPlaylist({ shareID: song.shareID, playlistID, playlistSongIDs: [song.playlistSongID] })
	}, [song, playlistID, removeSongsFromPlaylist])

	return (
		<>
			<ContextMenu ref={ref}>
				{contextMenuVisible && (
					<Menu>
						<ContextMenuItem key="information" onClick={() => onShowInformation(song!)}>
							Information
						</ContextMenuItem>
						<Menu.Divider />
						<ContextMenuItem key="playnow" onClick={onClickPlayNow}>
							Play now
						</ContextMenuItem>
						<ContextMenuItem key="playnext" onClick={onClickPlayNext}>
							Play next
						</ContextMenuItem>
						<ContextMenuItem key="playlater" onClick={onClickPlayLater}>
							Play later
						</ContextMenuItem>
						<Menu.Divider />
						<ContextMenuItem key="addtoplaylist" onClick={onClickAddSongToPlaylist}>
							Add to playlist
						</ContextMenuItem>
						<Menu.Divider />
						{song && song.libraryID === userLibraryID && (
							<ContextMenuItem key="removefromlibrary" onClick={onRemoveFromLibrary}>
								Remove from library
							</ContextMenuItem>
						)}
						{playlistID && (
							<ContextMenuItem key="removefromplaylist" onClick={onRemoveFromPlaylist}>
								Remove from playlist
							</ContextMenuItem>
						)}
					</Menu>
				)}
			</ContextMenu>
			<PlaylistPicker visible={showPickPlaylistModal} onSubmit={onSubmitPickPlaylists} />
		</>
	)
})
