import React, { useCallback } from "react";
import { IBaseSong } from "../../graphql/types";
import { usePlayer } from "../../player/player-hook";
import { useShareID } from "../../hooks/use-share";
import { ContextMenu } from "../../components/modals/contextmenu/ContextMenu";
import { Menu } from "antd";
import { useSongUtils } from "../../hooks/use-song-utils";

interface ISongContextMenuProps {
	song: IBaseSong | null;
	onShowInformation: () => void;
}

export const SongContextMenu = React.forwardRef<HTMLDivElement, ISongContextMenuProps>((props, ref) => {
	const { song, onShowInformation } = props
	const { changeSong, enqueueSong, enqueueSongNext } = usePlayer();
	const shareID = useShareID()
	const { makePlayableSong } = useSongUtils()

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

	return (
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
				<Menu.Item key="addtoplaylist" disabled>
					Add to playlist
    			</Menu.Item>
			</Menu>
		</ContextMenu>
	)
})