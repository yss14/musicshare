import React, { useCallback, useState } from "react"
import { Menu, message } from "antd"
import { ContextMenu, ContextMenuItem } from "../modals/contextmenu/ContextMenu"
import { Prompt } from "../modals/promt/Prompt"
import { useRenamePlaylist, useDeletePlaylist } from "@musicshare/react-graphql-client"
import { Playlist } from "@musicshare/shared-types"

interface IPlaylistSongContextMenuProps {
	playlist: Playlist
}

export const PlaylistContextMenu = React.forwardRef<HTMLDivElement, IPlaylistSongContextMenuProps>(
	({ playlist }, ref) => {
		const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null)
		const [deletePlaylist] = useDeletePlaylist({
			onSuccess: () => {
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
			deletePlaylist({ shareID: playlist.shareID, playlistID: playlist.id })
		}, [deletePlaylist, playlist])

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
	},
)
