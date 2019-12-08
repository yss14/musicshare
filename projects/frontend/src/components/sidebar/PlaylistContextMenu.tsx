import React, { useCallback } from 'react'
import { Menu, message } from "antd"
import { ContextMenu } from '../modals/contextmenu/ContextMenu'
import { IPlaylist } from '../../graphql/types'
import { useDeletePlaylist } from '../../graphql/mutations/delete-playlist-mutation'

interface IPlaylistSongContextMenuProps {
	playlist: IPlaylist;
}

export const PlaylistContextMenu = React.forwardRef<HTMLDivElement, IPlaylistSongContextMenuProps>((props, ref) => {
	const { playlist } = props
	const [deletePlaylist] = useDeletePlaylist({
		onCompleted: () => message.success(`Playlist deleted`),
		onError: console.error,
	})

	const onDeletePlaylist = useCallback(() => {
		deletePlaylist(playlist.shareID, playlist.id)
	}, [deletePlaylist, playlist])

	return (
		<ContextMenu ref={ref}>
			<Menu>
				<Menu.Item key="delete" onClick={onDeletePlaylist}>
					Delete
				</Menu.Item>
			</Menu>
		</ContextMenu>
	)
})
