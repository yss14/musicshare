import React from 'react'
import { IPlaylist } from "../../graphql/types"
import { useDrop } from "react-dnd"
import { DragNDropItem } from "../../types/DragNDropItems"
import { SidebarItem } from "./SidebarItem"
import { Link } from "react-router-dom"

interface IPlaylistSidebarItemProps {
	playlist: IPlaylist;
	selected: boolean;
	targetUrl: string;
}

export const PlaylistSidebarItem: React.FC<IPlaylistSidebarItemProps> = ({ playlist, selected, targetUrl }) => {
	const [{ canDrop, isOver }, drop] = useDrop({
		accept: DragNDropItem.Song,
		drop: () => ({ playlist }),
		collect: monitor => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	})

	const isOverStyle: React.CSSProperties = {
		backgroundColor: '#61676b',
	}

	return (
		<SidebarItem ref={drop} style={isOver && canDrop ? isOverStyle : {}} selected={selected}>
			<Link to={targetUrl}>
				{playlist.name}
			</Link>
		</SidebarItem>
	)
}