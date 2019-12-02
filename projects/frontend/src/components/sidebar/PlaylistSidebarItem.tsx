import React from 'react'
import { IPlaylist, IScopedSong } from "../../graphql/types"
import { useDrop } from "react-dnd"
import { DragNDropItem, IAcceptSong } from "../../types/DragNDropItems"
import { SidebarItem } from "./SidebarItem"
import { Link } from "react-router-dom"
import { useAddSongsToPlaylist } from '../../graphql/mutations/add-songs-to-playlist'

interface IMonitorProps {
	canDrop: boolean;
	isOver: boolean;
}

interface IPlaylistSidebarItemProps {
	playlist: IPlaylist;
	selected: boolean;
	targetUrl: string;
}

export const PlaylistSidebarItem: React.FC<IPlaylistSidebarItemProps> = ({ playlist, selected, targetUrl }) => {
	const addSongsToPlaylist = useAddSongsToPlaylist()

	const [{ canDrop, isOver }, drop] = useDrop<IAcceptSong, void, IMonitorProps>({
		accept: DragNDropItem.Song,
		drop: (item, monitor) => {
			if (item && item.song) {
				const song = item.song as IScopedSong

				if (song) {
					addSongsToPlaylist(playlist.shareID, playlist.id, [song.id])
				}
			}
		},
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