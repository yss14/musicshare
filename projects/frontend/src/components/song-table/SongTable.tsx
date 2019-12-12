import React, { useMemo, useCallback, useState, useEffect, useRef, useReducer } from 'react'
import { IScopedSong } from "../../graphql/types"
import { List, ListRowProps, AutoSizer } from 'react-virtualized'
import { useContextMenu } from '../modals/contextmenu/ContextMenu'
import { SongContextMenu, ISongContextMenuEvents } from '../../pages/share/SongContextMenu'
import { useDrag } from 'react-dnd'
import { DragNDropItem, ISongDNDItem } from '../../types/DragNDropItems'
import { isMutableRef } from '../../types/isMutableRef'
import { Empty } from 'antd';
import { useEventListener } from '../../hooks/use-event-listener'
import { SongRow } from './SongRow'
import { Table, Header, HeaderCol, Body } from './SongTableUI'
import { MoveSong } from './MoveSong'
import { IColumn } from './song-table-columns'

type Song = IScopedSong

interface ISongTableState {
	hoveredSong: Song | null;
	hoveredIdx: number;
}

interface IHoverSong {
	type: 'hover_song';
	payload: {
		song: Song | null;
		idx: number;
	}
}

const hoverSong = (song: Song | null, idx: number): IHoverSong => ({
	type: 'hover_song',
	payload: {
		song,
		idx,
	},
})

type SongTableAction = IHoverSong

const songTableReducer = (state: ISongTableState, action: SongTableAction): ISongTableState => {
	switch (action.type) {
		case 'hover_song': return { ...state, hoveredSong: action.payload.song, hoveredIdx: action.payload.idx }
		default: return state
	}
}

export interface IRowEvents {
	onClick?: (event: React.MouseEvent, song: Song, idx: number) => any;
	onContextMenu?: (event: React.MouseEvent, song: Song, idx: number) => any;
	onDoubleClick?: (event: React.MouseEvent, song: Song, idx: number) => any;
}

interface ISongDataTableProps {
	columns: IColumn[];
	songs: Song[];
	rowEvents: IRowEvents;
	contextMenuEvents: ISongContextMenuEvents;
	playlistID?: string;
	moveSong?: MoveSong;
}

export const SongTable: React.FC<ISongDataTableProps> = (props) => {
	const { columns, songs, rowEvents, playlistID, contextMenuEvents, moveSong } = props
	const [{ hoveredSong, hoveredIdx }, dispatch] = useReducer(songTableReducer, {
		hoveredSong: null,
		hoveredIdx: -1,
	})
	const { showContextMenu, isVisible: contextMenuVisible, ref: contextMenuRef } = useContextMenu()
	const [height, setHeight] = useState(0)
	const bodyRef = useRef<HTMLDivElement>(null)
	const accumulatedWidth = useMemo(() => columns.reduce((acc, col) => acc + col.width, 0), [columns])

	const [, drag, dragPreview] = useDrag<ISongDNDItem, void, {}>({
		item: { type: DragNDropItem.Song, song: hoveredSong!, idx: hoveredIdx },
	})

	const hookedRowEvents = useMemo((): IRowEvents => ({
		...rowEvents,
		onContextMenu: (event: React.MouseEvent, song: Song, idx: number) => {
			if (rowEvents.onContextMenu) rowEvents.onContextMenu(event, song, idx)

			showContextMenu(event)
		}
	}), [rowEvents, showContextMenu])

	const onRowMouseEnter = useCallback((song: Song, ref: React.Ref<HTMLDivElement>, idx: number) => {
		if (!contextMenuVisible) {
			dispatch(hoverSong(song, idx))
		}

		if (isMutableRef(ref)) {
			drag(ref.current)
		}
	}, [dispatch, contextMenuVisible, drag])

	const rowRenderer = useCallback((props: ListRowProps) => {
		const song = songs[props.index]

		return (
			<SongRow
				{...props}
				song={song}
				rowEvents={hookedRowEvents}
				columns={columns}
				hovered={hoveredSong === song}
				onMouseEnter={(e, ref) => onRowMouseEnter(song, ref, props.index)}
				dragPreview={dragPreview}
				moveSong={moveSong}
				isPlaylist={playlistID !== undefined}
			/>
		)
	}, [hoveredSong, hookedRowEvents, columns, songs, dragPreview, onRowMouseEnter, moveSong, playlistID])

	const evaluateAndSetHeight = useCallback(() => {
		if (bodyRef.current) {
			setHeight(bodyRef.current.clientHeight)
		}
	}, [bodyRef, setHeight])

	useEffect(evaluateAndSetHeight, [evaluateAndSetHeight])

	useEventListener('resize', () => {
		evaluateAndSetHeight()
	}, window)

	return (
		<Table>
			<Header>
				{columns.map(column => (
					<HeaderCol
						key={column.title}
						style={{ width: `${(column.width / accumulatedWidth) * 100}%` }}
					>
						{column.title}
					</HeaderCol>
				))}
			</Header>
			<Body ref={bodyRef}>
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
						/>
					)}
				</AutoSizer>
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
