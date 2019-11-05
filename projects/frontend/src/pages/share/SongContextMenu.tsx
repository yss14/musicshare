import React, { useCallback, useState } from "react";
import { IPlaylist, IScopedSong } from "../../graphql/types";
import { usePlayer } from "../../player/player-hook";
import { ContextMenu } from "../../components/modals/contextmenu/ContextMenu";
import { Menu } from "antd";
import { useSongUtils } from "../../hooks/use-song-utils";
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist";
import { PlaylistPicker } from "../../components/modals/playlist-picker/PlaylistPicker";
import { useShareID } from "../../graphql/client/queries/shareid-query";

interface ISongContextMenuProps {
	song: IScopedSong | null;
	onShowInformation: () => void;
}

export const SongContextMenu = React.forwardRef<HTMLDivElement, ISongContextMenuProps>((props, ref) => {
	const { song, onShowInformation } = props
	const [showPickPlaylistModal, setShowPickPlaylistModal] = useState(false)
	const { changeSong, enqueueSong, enqueueSongNext } = usePlayer();
	const shareID = useShareID()
	const { makePlayableSong } = useSongUtils()
	const addSongsToPlaylist = useAddSongsToPlaylist()

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

	const onClickAddSongToPlaylist = () => {
		if (!song) return

		setShowPickPlaylistModal(true)
	}

	const onSubmitPickPlaylists = (playlists: IPlaylist[]) => {
		if (!song) return

		setShowPickPlaylistModal(false)
		console.log(playlists)
		playlists.map(playlist => addSongsToPlaylist(playlist.shareID, playlist.id, [song.id]))
	}

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
				</Menu>
			</ContextMenu>
			<PlaylistPicker visible={showPickPlaylistModal} onSubmit={onSubmitPickPlaylists} />
		</>
	)
})