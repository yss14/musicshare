import React, { useMemo, useCallback, useState, useEffect, useRef, useReducer } from 'react'
import { IScopedSong } from "../../graphql/types"
import styled from "styled-components"
import { List, ListRowProps, AutoSizer } from 'react-virtualized'
import { useContextMenu } from '../modals/contextmenu/ContextMenu'
import { SongContextMenu } from '../../pages/share/SongContextMenu'
import { useDrag, DragPreviewImage, DragElementWrapper, DragPreviewOptions } from 'react-dnd'
import { DragNDropItem } from '../../types/DragNDropItems'
import { isMutableRef } from '../../types/isMutableRef'
import songDragPreviewImg from '../../images/playlist_add.png'

const Table = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`

const Header = styled.div`
	width: 100%;
	background-color: #fafafa;
	display: flex;
	flex-direction: row;
`

const Col = styled.div`
	padding: 3px 6px;
	box-sizing: border-box;
`

const HeaderCol = styled(Col)`
	padding: 4px 6px;
	border-top: 1px solid #dcdcdc;
    border-bottom: 1px solid #dcdcdc;
`

const Body = styled.div`
	flex: 1 1 0px;
	overflow: auto;
`

const Row = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;

	&:hover{
		background-color: #e6f6ff;
	}
`

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

interface IRowEvents {
	onClick?: (event: React.MouseEvent, song: Song, idx: number) => any;
	onContextMenu?: (event: React.MouseEvent, song: Song, idx: number) => any;
	onDoubleClick?: (event: React.MouseEvent, song: Song, idx: number) => any;
}

interface ISongDataTableProps {
	columns: IColumn[];
	songs: Song[];
	rowEvents?: IRowEvents;
	playlistID?: string;
}

export const SongDataTable: React.FC<ISongDataTableProps> = (props) => {
	const { columns, songs, rowEvents, playlistID } = props
	const [{ hoveredSong }, dispatch] = useReducer(songTableReducer, {
		hoveredSong: null,
	})
	const contextMenuRef = useRef<HTMLDivElement>(null)
	const { showContextMenu, isVisible: contextMenuVisible } = useContextMenu(contextMenuRef)
	const [height, setHeight] = useState(0)
	const bodyRef = useRef<HTMLDivElement>(null)
	const accumulatedWidth = useMemo(() => columns.reduce((acc, col) => acc + col.width, 0), [columns])

	const [, drag, dragPreview] = useDrag({
		item: { type: DragNDropItem.Song, song: hoveredSong },
	})

	const hookedRowEvents = useMemo((): IRowEvents => ({
		...rowEvents,
		onContextMenu: (event: React.MouseEvent, song: Song, idx: number) => {
			if (rowEvents && rowEvents.onContextMenu) rowEvents.onContextMenu(event, song, idx)

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

	useEffect(() => {
		if (bodyRef.current) {
			setHeight(bodyRef.current.clientHeight)
		}
	}, [bodyRef])

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
							noRowsRenderer={() => <div>No Songs...</div>}
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
				onShowInformation={() => undefined}
			/>
		</Table>
	)
}

interface ISongRowProps extends ListRowProps {
	columns: IColumn[];
	song: Song;
	rowEvents?: IRowEvents;
	hovered: boolean;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, ref: React.Ref<HTMLDivElement>) => void;
	dragPreview: DragElementWrapper<DragPreviewOptions>;
}

const SongRow: React.FC<ISongRowProps> = ({ index, style, rowEvents, columns, song, hovered, onMouseEnter, dragPreview }) => {
	const rowRef = useRef<HTMLDivElement>(null)
	const accumulatedWidth = useMemo(() => columns.reduce((acc, col) => acc + col.width, 0), [columns])

	const onClick = (event: React.MouseEvent) => rowEvents && rowEvents.onClick ? rowEvents.onClick(event, song, index) : undefined
	const onContextMenu = (event: React.MouseEvent) => rowEvents && rowEvents.onContextMenu ? rowEvents.onContextMenu(event, song, index) : undefined
	const onDoubleClick = (event: React.MouseEvent) => rowEvents && rowEvents.onDoubleClick ? rowEvents.onDoubleClick(event, song, index) : undefined

	return (
		<>
			<Row
				ref={rowRef}
				style={{ ...style, backgroundColor: hovered ? '#e6f6ff' : 'transparent' }}
				onClick={onClick}
				onContextMenu={onContextMenu}
				onDoubleClick={onDoubleClick}
				onMouseEnter={e => onMouseEnter ? onMouseEnter(e, rowRef) : undefined}
			>
				{columns.map(column => (
					<Col
						key={`song-${song.id}-${index}-${column.title}`}
						style={{ width: `${(column.width / accumulatedWidth) * 100}%` }}
					>
						{column.render(song)}
					</Col>
				))}
			</Row>
			<DragPreviewImage connect={dragPreview} src={songDragPreviewImg} />
		</>
	)
}
