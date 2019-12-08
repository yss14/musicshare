import React, { useMemo, useCallback, useState, useEffect, useRef, useReducer } from 'react'
import { IScopedSong } from "../../graphql/types"
import { List, ListRowProps, AutoSizer } from 'react-virtualized'
import { useContextMenu } from '../modals/contextmenu/ContextMenu'
import { SongContextMenu, ISongContextMenuEvents } from '../../pages/share/SongContextMenu'
import { useDrag } from 'react-dnd'
import { DragNDropItem } from '../../types/DragNDropItems'
import { isMutableRef } from '../../types/isMutableRef'
import { Empty } from 'antd';
import { useEventListener } from '../../hooks/use-event-listener'
import { SongRow } from './SongRow'
import { Table, Header, HeaderCol, Body } from './SongTableUI'

type Song = IScopedSong

interface ISongTableState {
	hoveredSong: Song | null;
}

interface IHoverSong {
	type: 'hover_song';
	payload: Song | null;
}

const hoverSong = (song: Song | null): IHoverSong => ({
	type: 'hover_song',
	payload: song,
})

type SongTableAction = IHoverSong

const songTableReducer = (state: ISongTableState, action: SongTableAction): ISongTableState => {
	switch (action.type) {
		case 'hover_song': return { ...state, hoveredSong: action.payload }
		default: return state
	}
}

export interface IColumn {
	title: string;
	width: number;
	key: string;
	render: (song: Song) => string | number | React.ReactElement<any>;
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
}

export const SongDataTable: React.FC<ISongDataTableProps> = (props) => {
	const { columns, songs, rowEvents, playlistID, contextMenuEvents } = props
	const [{ hoveredSong }, dispatch] = useReducer(songTableReducer, {
		hoveredSong: null,
	})
	const { showContextMenu, isVisible: contextMenuVisible, ref: contextMenuRef } = useContextMenu()
	const [height, setHeight] = useState(0)
	const bodyRef = useRef<HTMLDivElement>(null)
	const accumulatedWidth = useMemo(() => columns.reduce((acc, col) => acc + col.width, 0), [columns])

	const [, drag, dragPreview] = useDrag({
		item: { type: DragNDropItem.Song, song: hoveredSong },
	})

	const hookedRowEvents = useMemo((): IRowEvents => ({
		...rowEvents,
		onContextMenu: (event: React.MouseEvent, song: Song, idx: number) => {
			if (rowEvents.onContextMenu) rowEvents.onContextMenu(event, song, idx)

			showContextMenu(event)
		}
	}), [rowEvents, showContextMenu])

	const onRowMouseEnter = useCallback((song: Song, ref: React.Ref<HTMLDivElement>) => {
		if (!contextMenuVisible) {
			dispatch(hoverSong(song))
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
				onMouseEnter={(e, ref) => onRowMouseEnter(song, ref)}
				dragPreview={dragPreview}
			/>
		)
	}, [hoveredSong, hookedRowEvents, columns, songs, dragPreview, onRowMouseEnter])

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
