import React, { useCallback, useState } from "react"
import { Menu, message } from "antd"
import { ContextMenu } from "../modals/contextmenu/ContextMenu"
import { IPlaylist } from "../../graphql/types"
import { useDeletePlaylist } from "../../graphql/mutations/delete-playlist-mutation"
import { useRenamePlaylist } from "../../graphql/mutations/rename-playlist-mutation"
import { Prompt } from "../modals/promt/Prompt"

interface IPlaylistSongContextMenuProps {
	playlist: IPlaylist
	isMergedView: boolean
}

export const PlaylistContextMenu = React.forwardRef<HTMLDivElement, IPlaylistSongContextMenuProps>((props, ref) => {
	const { playlist, isMergedView } = props
	const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null)
	const [deletePlaylist] = useDeletePlaylist({
		onCompleted: () => {
			message.success(`Playlist successfully deleted`)
		},
		onError: console.error,
	})
	const [renamePlaylist] = useRenamePlaylist({
		onCompleted: () => {
			message.success(`Playlist successfully renamed`)
		},
		onError: console.error,
	})

	const onDeletePlaylist = useCallback(() => {
		deletePlaylist(playlist.shareID, playlist.id, isMergedView)
	}, [deletePlaylist, playlist, isMergedView])

	const onRenamePlaylist = useCallback(() => {
		setNewPlaylistName(playlist.name)
	}, [playlist.name])

	const handleRenamePlaylist = useCallback(() => {
		if (!newPlaylistName) return

		renamePlaylist(newPlaylistName, playlist.shareID, playlist.id, isMergedView)
		setNewPlaylistName(null)
	}, [renamePlaylist, isMergedView, newPlaylistName, playlist.id, playlist.shareID])

	return (
		<>
			<ContextMenu ref={ref}>
				<Menu>
					<Menu.Item key="delete" onClick={onDeletePlaylist}>
						Delete
					</Menu.Item>
					<Menu.Item key="rename" onClick={onRenamePlaylist}>
						Rename
					</Menu.Item>
				</Menu>
			</ContextMenu>
			{newPlaylistName !== null && (
				<Prompt
					title="Rename Playlist"
					okText="Rename"
					onSubmit={handleRenamePlaylist}
					onCancel={() => setNewPlaylistName(null)}
					onChange={(e) => setNewPlaylistName(e.target.value)}
					value={newPlaylistName}
					validationError={newPlaylistName.trim().length === 0 ? "At least one character" : undefined}
				/>
			)}
		</>
	)
})
