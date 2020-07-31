import React, { useRef, useEffect, useMemo } from "react"
import { ListRowProps } from "react-virtualized"
import { IRowEvents } from "./SongTable"
import { DragElementWrapper, DragPreviewOptions, DragPreviewImage, useDrop, DropTargetHookSpec } from "react-dnd"
import { Row, Col } from "./SongTableUI"
import songDragPreviewImg from "../../images/playlist_add.png"
import { DragNDropItem, ISongDNDItem } from "../../types/DragNDropItems"
import { MoveSong } from "./MoveSong"
import { CalculatedColumnWidths } from "./SongTableColumns"
import { useSongsViewContext } from "./SongsView"
import { IShareSong } from "@musicshare/shared-types"

interface ISongRowProps extends ListRowProps {
	song: IShareSong
	rowEvents?: IRowEvents
	hovered: boolean
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, ref: React.Ref<HTMLDivElement>) => void
	dragPreview: DragElementWrapper<DragPreviewOptions>
	moveSong?: MoveSong
	isPlaylist: boolean
	calculatedColumnWidths: CalculatedColumnWidths
}

export const SongRow: React.FC<ISongRowProps> = ({
	index,
	style,
	rowEvents,
	song,
	hovered,
	onMouseEnter,
	dragPreview,
	moveSong,
	isPlaylist,
	calculatedColumnWidths,
}) => {
	const rowRef = useRef<HTMLDivElement>(null)
	const songsViewContext = useSongsViewContext()
	const { columns, songs } = songsViewContext[0]

	const useDropOpts = useMemo<DropTargetHookSpec<ISongDNDItem, void, { isOver: boolean }>>(
		() => ({
			accept: DragNDropItem.Song,
			canDrop: () => isPlaylist,
			collect: (monitor) => ({ isOver: isPlaylist && monitor.isOver() }),
			drop: (item) => {
				if (moveSong) {
					moveSong(item.song, song)
				}
			},
		}),
		[isPlaylist, moveSong, song],
	)

	const [{ isOver }, drop] = useDrop<ISongDNDItem, void, { isOver: boolean }>(useDropOpts)

	useEffect(() => {
		if (rowRef.current) {
			drop(rowRef.current)
		}
	}, [rowRef, drop])

	const onClick = (event: React.MouseEvent) =>
		rowEvents && rowEvents.onClick ? rowEvents.onClick({ event, song, idx: index, songs }) : undefined
	const onContextMenu = (event: React.MouseEvent) =>
		rowEvents && rowEvents.onContextMenu ? rowEvents.onContextMenu({ event, song, idx: index, songs }) : undefined
	const onDoubleClick = (event: React.MouseEvent) =>
		rowEvents && rowEvents.onDoubleClick ? rowEvents.onDoubleClick({ event, song, idx: index, songs }) : undefined

	return (
		<>
			<Row
				ref={rowRef}
				style={{
					...style,
					backgroundColor: isOver ? "#2587fa" : hovered ? "#e6f6ff" : "transparent",
				}}
				onClick={onClick}
				onContextMenu={onContextMenu}
				onDoubleClick={onDoubleClick}
				onMouseEnter={(e) => (onMouseEnter ? onMouseEnter(e, rowRef) : undefined)}
			>
				{columns.map((column) => (
					<Col
						key={`song-${song.id}-${index}-${column.title}`}
						style={{
							width: calculatedColumnWidths[column.key],
							flexShrink: column.fixWidth ? 0 : undefined,
						}}
					>
						{column.render(song, index, songsViewContext)}
					</Col>
				))}
			</Row>
			<DragPreviewImage connect={dragPreview} src={songDragPreviewImg} />
		</>
	)
}
