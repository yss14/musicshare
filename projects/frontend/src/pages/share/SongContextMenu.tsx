import React, { useCallback, useState } from "react";
import { IBaseSong, IPlaylist } from "../../graphql/types";
import { usePlayer } from "../../player/player-hook";
import { useShareID } from "../../hooks/use-share";
import { ContextMenu } from "../../components/modals/contextmenu/ContextMenu";
import { Menu } from "antd";
import { useSongUtils } from "../../hooks/use-song-utils";
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist";
import SubMenu from "antd/lib/menu/SubMenu";
import { PlaylistPicker } from "../../components/modals/playlist-picker/PlaylistPicker";

interface ISongContextMenuProps {
	song: IBaseSong | null;
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

		changeSong(makePlayableSong(shareID)(song))
	}, [song, shareID, makePlayableSong, changeSong])

	const onClickPlayNext = useCallback(() => {
		if (!song) return

		enqueueSongNext(makePlayableSong(shareID)(song))
	}, [song, shareID, makePlayableSong, enqueueSongNext])

	const onClickPlayLater = useCallback(() => {
		if (!song) return

		enqueueSong(makePlayableSong(shareID)(song))
	}, [song, shareID, makePlayableSong, enqueueSong])

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