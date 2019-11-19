import React, { useCallback, useState } from "react";
import { IPlaylist, IScopedSong } from "../../graphql/types";
import { usePlayer } from "../../player/player-hook";
import { ContextMenu } from "../../components/modals/contextmenu/ContextMenu";
import { Menu } from "antd";
import { useSongUtils } from "../../hooks/use-song-utils";
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist";
import { PlaylistPicker } from "../../components/modals/playlist-picker/PlaylistPicker";
import { useLibraryID } from "../../graphql/client/queries/libraryid-query";

interface ISongContextMenuProps {
	song: IScopedSong | null;
	playlistID?: string;
	onShowInformation: () => void;
}

export const SongContextMenu = React.forwardRef<HTMLDivElement, ISongContextMenuProps>((props, ref) => {
	const { song, onShowInformation, playlistID } = props
	const [showPickPlaylistModal, setShowPickPlaylistModal] = useState(false)
	const { changeSong, enqueueSong, enqueueSongNext } = usePlayer();
	const { makePlayableSong } = useSongUtils()
	const addSongsToPlaylist = useAddSongsToPlaylist()
	const userLibraryID = useLibraryID()

	const onClickPlayNow = useCallback(() => {
		if (!song) return

		changeSong(makePlayableSong(song))
	}, [song, makePlayableSong, changeSong])

	const onClickPlayNext = useCallback(() => {
		if (!song) return

		enqueueSongNext(makePlayableSong(song))
	}, [song, makePlayableSong, enqueueSongNext])

	const onClickPlayLater = useCallback(() => {
		if (!song) return

		enqueueSong(makePlayableSong(song))
	}, [song, makePlayableSong, enqueueSong])

	const onClickAddSongToPlaylist = useCallback(() => {
		if (!song) return

		setShowPickPlaylistModal(true)
	}, [song, setShowPickPlaylistModal])

	const onSubmitPickPlaylists = useCallback((playlists: IPlaylist[]) => {
		if (!song) return

		setShowPickPlaylistModal(false)

		playlists.map(playlist => addSongsToPlaylist(playlist.shareID, playlist.id, [song.id]))
	}, [song, setShowPickPlaylistModal, addSongsToPlaylist])

	const onRemoveFromLibrary = useCallback(() => {
		if (!song) return
	}, [song])

	const onRemoveFromPlaylist = useCallback(() => {
		if (!song) return
	}, [song])

	console.log(song)

	return (
		<>
			<ContextMenu ref={ref}>
				<Menu>
					<Menu.Item key="information" onClick={onShowInformation}>
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
					{!playlistID && song && song.libraryID === userLibraryID && (
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