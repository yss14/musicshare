import React, { useCallback, useState } from "react"
import { Menu, message } from "antd"
import { ContextMenu, ContextMenuItem } from "../modals/contextmenu/ContextMenu"
import { IPlaylist } from "../../graphql/types"
import { useDeletePlaylist } from "../../graphql/mutations/delete-playlist-mutation"
import { Prompt } from "../modals/promt/Prompt"
import { useRenamePlaylist } from "@musicshare/graphql-client"

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
		onSuccess: () => {
			message.success(`Playlist successfully renamed`)
		},
	})

	const onDeletePlaylist = useCallback(() => {
		deletePlaylist(playlist.shareID, playlist.id, isMergedView)
	}, [deletePlaylist, playlist, isMergedView])

	const onRenamePlaylist = useCallback(() => {
		setNewPlaylistName(playlist.name)
	}, [playlist.name])

	const handleRenamePlaylist = useCallback(() => {
		if (!newPlaylistName) return

		renamePlaylist({
			newName: newPlaylistName,
			shareID: playlist.shareID,
			playlistID: playlist.id,
		})
		setNewPlaylistName(null)
	}, [renamePlaylist, newPlaylistName, playlist.id, playlist.shareID])

	return (
		<>
			<ContextMenu ref={ref}>
				<Menu>
					<ContextMenuItem key="delete" onClick={onDeletePlaylist}>
						Delete
					</ContextMenuItem>
					<ContextMenuItem key="rename" onClick={onRenamePlaylist}>
						Rename
					</ContextMenuItem>
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
