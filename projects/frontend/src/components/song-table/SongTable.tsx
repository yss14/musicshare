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
import { IColumn, useCalculatedColumnWidths } from './song-table-columns'
import { zip } from 'lodash'
import { filterUndefined } from '../../utils/filter-null'

type Song = IScopedSong
type OrderDirection = 'asc' | 'desc'

interface ISongTableState {
	hoveredSong: Song | null;
	hoveredIdx: number;
	orderByColumn: string;
	orderDirection: OrderDirection;
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

interface ISetOrderCriteria {
	type: 'order_criteria';
	payload: {
		column: string;
		direction: OrderDirection;
	}
}

const setOrderCriteria = (column: string, direction: OrderDirection): ISetOrderCriteria => ({
	type: 'order_criteria',
	payload: {
		column,
		direction,
	}
})

type SongTableAction = IHoverSong | ISetOrderCriteria

const songTableReducer = (state: ISongTableState, action: SongTableAction): ISongTableState => {
	switch (action.type) {
		case 'hover_song': return { ...state, hoveredSong: action.payload.song, hoveredIdx: action.payload.idx }
		case 'order_criteria': return { ...state, orderByColumn: action.payload.column, orderDirection: action.payload.direction }
		default: return state
	}
}

export interface IRowEvents {
	onClick?: (event: React.MouseEvent, song: Song, idx: number) => any;
	onContextMenu?: (event: React.MouseEvent, song: Song, idx: number) => any;
	onDoubleClick?: (event: React.MouseEvent, song: Song, idx: number) => any;
}

const toggleDirection = (dir: OrderDirection): OrderDirection => dir === 'asc' ? 'desc' : 'asc'

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
	const enableOrdering = !playlistID
	const [{ hoveredSong, hoveredIdx, orderByColumn, orderDirection }, dispatch] = useReducer(songTableReducer, {
		hoveredSong: null,
		hoveredIdx: -1,
		orderByColumn: playlistID ? 'position' : 'title',
		orderDirection: 'desc',
	})
	const { showContextMenu, isVisible: contextMenuVisible, ref: contextMenuRef } = useContextMenu()
	const [height, setHeight] = useState(0)
	const bodyRef = useRef<HTMLDivElement>(null)
	const calculatedColumnWidths = useCalculatedColumnWidths(columns)

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

	const orderedSongs = useMemo(() => {
		const column = columns.find(column => column.key === orderByColumn)

		if (!column) {
			console.warn(`Cannot order songs, column with key ${orderByColumn} not found`)

			return songs
		}

		const renderedSongColumn = songs.map((song, idx) => column.render(song, idx))
		const zippedSongs = zip(songs, renderedSongColumn)
		const orderedSongs = zippedSongs
			.sort((lhs, rhs) => lhs[1]!.localeCompare(rhs[1]!))
			.map(zipped => zipped[0])
			.filter(filterUndefined)

		return orderDirection === 'asc' ? [...orderedSongs].reverse() : orderedSongs
	}, [songs, orderByColumn, orderDirection, columns])

	const rowRenderer = useCallback((props: ListRowProps) => {
		const song = orderedSongs[props.index]

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
				calculatedColumnWidths={calculatedColumnWidths}
			/>
		)
	}, [hoveredSong, hookedRowEvents, columns, orderedSongs, dragPreview, onRowMouseEnter, moveSong, playlistID, calculatedColumnWidths])

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
						style={{ width: calculatedColumnWidths[column.key] }}
						onClick={enableOrdering ? () => dispatch(setOrderCriteria(column.key, toggleDirection(orderDirection))) : undefined}
						selected={enableOrdering && orderByColumn === column.key}
						direction={orderDirection}
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
							rowCount={orderedSongs.length}
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
