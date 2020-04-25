import React from "react"
import { IPlaylist, IScopedSong } from "../../graphql/types"
import { useDrop } from "react-dnd"
import { DragNDropItem, ISongDNDItem } from "../../types/DragNDropItems"
import { SidebarItem } from "./SidebarItem"
import { Link } from "react-router-dom"
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist"

interface IMonitorProps {
	canDrop: boolean
	isOver: boolean
}

interface IPlaylistSidebarItemProps {
	playlist: IPlaylist
	selected: boolean
	targetUrl: string
	onContextMenu?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
	onMouseEnter?: () => void
}

export const PlaylistSidebarItem: React.FC<IPlaylistSidebarItemProps> = ({
	playlist,
	selected,
	targetUrl,
	onContextMenu,
	onMouseEnter,
}) => {
	const addSongsToPlaylist = useAddSongsToPlaylist()

	const [{ canDrop, isOver }, drop] = useDrop<ISongDNDItem, void, IMonitorProps>({
		accept: DragNDropItem.Song,
		drop: (item, monitor) => {
			if (item && item.song) {
				const song = item.song as IScopedSong

				if (song) {
					addSongsToPlaylist(playlist.shareID, playlist.id, [song.id])
				}
			}
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	})

	const isOverStyle: React.CSSProperties = {
		backgroundColor: "#61676b",
	}

	return (
		<SidebarItem
			ref={drop}
			style={isOver && canDrop ? isOverStyle : {}}
			selected={selected}
			onContextMenu={onContextMenu}
			onMouseEnter={onMouseEnter}
		>
			<Link to={targetUrl} onContextMenu={onContextMenu}>
				{playlist.name}
			</Link>
		</SidebarItem>
	)
}
