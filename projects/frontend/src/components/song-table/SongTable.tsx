import React, { useMemo, useCallback, useState, useEffect, useRef } from "react"
import { IScopedSong } from "../../graphql/types"
import { List, ListRowProps, AutoSizer } from "react-virtualized"
import { useContextMenu } from "../modals/contextmenu/ContextMenu"
import { SongContextMenu, ISongContextMenuEvents } from "../../pages/share/SongContextMenu"
import { useDrag } from "react-dnd"
import { DragNDropItem, ISongDNDItem } from "../../types/DragNDropItems"
import { isMutableRef } from "../../types/isMutableRef"
import { Empty } from "antd"
import { useEventListener } from "../../hooks/use-event-listener"
import { SongRow } from "./SongRow"
import { Table, Header, HeaderCol, Body } from "./SongTableUI"
import { MoveSong } from "./MoveSong"
import { useCalculatedColumnWidths } from "./song-table-columns"
import Scrollbars from "react-custom-scrollbars"
import styled from "styled-components"
import { useSongsViewContext } from "./SongsView"
import { SortOrder } from "antd/lib/table/interface"

const StyledScrollbars = styled(Scrollbars)`
	& > div:first-child {
		overflow: visible !important; /* disable horizontal scroll bar*/
		margin-bottom: 0px !important;
	}
`

type Song = IScopedSong

export interface IRowEventsArgs {
	event: React.MouseEvent
	songs: Song[]
	song: Song
	idx: number
}

export interface IRowEvents {
	onClick?: (args: IRowEventsArgs) => any
	onContextMenu?: (args: IRowEventsArgs) => any
	onDoubleClick?: (args: IRowEventsArgs) => any
}

const toggleDirection = (dir: SortOrder): SortOrder => (dir === "ascend" ? "descend" : "ascend")

interface ISongDataTableProps {
	rowEvents: IRowEvents
	contextMenuEvents: ISongContextMenuEvents
	playlistID?: string
	moveSong?: MoveSong
}

export const SongTable: React.FC<ISongDataTableProps> = ({ rowEvents, playlistID, contextMenuEvents, moveSong }) => {
	const [
		{ songs, columns, hoveredSong, hoveredIdx, sortColumn, sortOrder },
		{ setHoveredSong, setOrderCriteria },
	] = useSongsViewContext()
	const enableOrdering = !playlistID
	const { showContextMenu, isVisible: contextMenuVisible, ref: contextMenuRef } = useContextMenu()
	const [height, setHeight] = useState(0)
	const bodyRef = useRef<HTMLDivElement>(null)
	const calculatedColumnWidths = useCalculatedColumnWidths(columns)

	const [, drag, dragPreview] = useDrag<ISongDNDItem, void, {}>({
		item: { type: DragNDropItem.Song, song: hoveredSong!, idx: hoveredIdx },
	})

	const hookedRowEvents = useMemo(
		(): IRowEvents => ({
			...rowEvents,
			onContextMenu: ({ event, song, idx, songs }) => {
				if (rowEvents.onContextMenu) {
					rowEvents.onContextMenu({ event, song, idx, songs })
				}

				showContextMenu(event)
			},
		}),
		[rowEvents, showContextMenu],
	)

	const onRowMouseEnter = useCallback(
		(song: Song, ref: React.Ref<HTMLDivElement>, idx: number) => {
			if (!contextMenuVisible) {
				setHoveredSong(song, idx)
			}

			if (isMutableRef(ref)) {
				drag(ref.current)
			}
		},
		[setHoveredSong, contextMenuVisible, drag],
	)

	const rowRenderer = useCallback(
		(props: ListRowProps) => {
			const song = songs[props.index]

			return (
				<SongRow
					{...props}
					song={song}
					songs={songs}
					rowEvents={hookedRowEvents}
					columns={columns}
					hovered={hoveredSong === song}
					onMouseEnter={(e, ref) => onRowMouseEnter(song, ref, props.index)}
					dragPreview={dragPreview}
					moveSong={moveSong}
					isPlaylist={playlistID !== undefined}
					calculatedColumnWidths={calculatedColumnWidths}
				/>
			)
		},
		[
			hoveredSong,
			hookedRowEvents,
			columns,
			songs,
			dragPreview,
			onRowMouseEnter,
			moveSong,
			playlistID,
			calculatedColumnWidths,
		],
	)

	const evaluateAndSetHeight = useCallback(() => {
		if (bodyRef.current) {
			setHeight(bodyRef.current.clientHeight)
		}
	}, [bodyRef, setHeight])

	useEffect(evaluateAndSetHeight, [evaluateAndSetHeight])

	useEventListener(
		"resize",
		() => {
			evaluateAndSetHeight()
		},
		window,
	)

	return (
		<Table>
			<Header>
				{columns.map((column) => (
					<HeaderCol
						key={column.title}
						style={{ width: calculatedColumnWidths[column.key] }}
						onClick={
							enableOrdering ? () => setOrderCriteria(column.key, toggleDirection(sortOrder)) : undefined
						}
						selected={enableOrdering && sortColumn === column.key}
						direction={sortOrder}
					>
						{column.title}
					</HeaderCol>
				))}
			</Header>
			<Body ref={bodyRef}>
				<StyledScrollbars autoHide>
					<AutoSizer disableHeight>
						{({ width }) => (
							<List
								height={height}
								overscanRowCount={100}
								noRowsRenderer={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
								rowCount={songs.length}
								rowHeight={27}
								rowRenderer={rowRenderer}
								width={width}
								style={{ outline: 0 }}
							/>
						)}
					</AutoSizer>
				</StyledScrollbars>
			</Body>
			<SongContextMenu
				song={hoveredSong}
				playlistID={playlistID}
				ref={contextMenuRef}
				events={contextMenuEvents}
			/>
		</Table>
	)
}
