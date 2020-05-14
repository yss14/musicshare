import React from "react"
import { IPlaylist, IScopedSong } from "../../graphql/types"
import { useDrop } from "react-dnd"
import { DragNDropItem, ISongDNDItem } from "../../types/DragNDropItems"
import { SidebarItem } from "./SidebarItem"
import { Link } from "react-router-dom"
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist"
import styled from "styled-components"
import { useShareName } from "../../hooks/use-share-name"

interface IHoverableTagLinkProps {
	text?: string
}

const HoverableTagLink = styled(Link)<IHoverableTagLinkProps>`
	&:hover:after {
		content: "${({ text }) => text}";
		display: ${({ text }) => (text && text.length > 0 ? "inline-block" : "none")};
		border: 1px solid white;
		padding: 0px 4px;
		font-size: 12px;
		border-radius: 4px;
		color: white;
	}

	& > span {
		margin-right: 4px;
	}
`

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
	isMergedView: boolean
}

export const PlaylistSidebarItem: React.FC<IPlaylistSidebarItemProps> = ({
	playlist,
	selected,
	targetUrl,
	onContextMenu,
	onMouseEnter,
	isMergedView,
}) => {
	const addSongsToPlaylist = useAddSongsToPlaylist()
	const playlistShareName = useShareName(playlist.shareID)

	const [{ canDrop, isOver }, drop] = useDrop<ISongDNDItem, void, IMonitorProps>({
		accept: DragNDropItem.Song,
		drop: (item) => {
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
			<HoverableTagLink
				to={targetUrl}
				onContextMenu={onContextMenu}
				text={isMergedView ? playlistShareName : undefined}
			>
				<span>{playlist.name}</span>
			</HoverableTagLink>
		</SidebarItem>
	)
}
