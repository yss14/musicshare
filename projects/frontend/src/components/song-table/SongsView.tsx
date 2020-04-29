import React, { useReducer, useContext, useMemo, useEffect } from "react"
import { IScopedSong } from "../../graphql/types"
import { ISongTableColumn, isSortableColumn } from "./SongTableColumns"
import { zip } from "lodash"
import { filterUndefined } from "../../utils/filter-null"
import { SortOrder } from "antd/lib/table/interface"
import useDeepCompareEffect from "use-deep-compare-effect"

type Song = IScopedSong

export type SongsFilter = (filterValue: string, song: Song) => boolean

/******************** Start Actions *******************/
interface ISetHoveredSong extends ReturnType<typeof setHoveredSong> {}

const setHoveredSong = (song: Song | null, idx: number) => ({
	type: "hover_song" as const,
	payload: {
		song,
		idx,
	},
})

interface ISetOrderCriteria extends ReturnType<typeof setOrderCriteria> {}

const setOrderCriteria = (column: string, direction: SortOrder) => ({
	type: "order_criteria" as const,
	payload: {
		column,
		direction,
	},
})

interface ISetCurrentlyPlayedSong extends ReturnType<typeof setCurrentlyPlayedSong> {}

const setCurrentlyPlayedSong = (song: Song | null) => ({
	type: "currently_played_song" as const,
	payload: song,
})

interface ISetColumns extends ReturnType<typeof setColumns> {}

const setColumns = (columns: ISongTableColumn[]) => ({
	type: "set_columns" as const,
	payload: columns,
})

interface ISetSongs extends ReturnType<typeof setSongs> {}

const setSongs = (songs: Song[]) => ({
	type: "set_songs" as const,
	payload: songs,
})

type SongsViewAction = ISetHoveredSong | ISetOrderCriteria | ISetCurrentlyPlayedSong | ISetColumns | ISetSongs

/******************** End Actions *******************/

interface ISongsViewBaseState {
	songs: Song[]
	columns: ISongTableColumn[]
	currentlyPlayedSong: Song | null
}

export interface ISongsViewState extends ISongsViewBaseState {
	sortOrder: SortOrder
	sortColumn: string
	hoveredSong: Song | null
	hoveredIdx: number
}

const songsViewReducer = (state: ISongsViewState, action: SongsViewAction): ISongsViewState => {
	switch (action.type) {
		case "hover_song":
			return { ...state, hoveredSong: action.payload.song, hoveredIdx: action.payload.idx }
		case "order_criteria":
			return { ...state, sortColumn: action.payload.column, sortOrder: action.payload.direction }
		case "currently_played_song":
			return { ...state, currentlyPlayedSong: action.payload }
		case "set_columns":
			return { ...state, columns: action.payload }
		case "set_songs":
			return { ...state, songs: action.payload }
	}
}

export interface ISongsViewContextActions {
	setHoveredSong: (song: Song | null, idx: number) => void
	setOrderCriteria: (column: string, direction: SortOrder) => void
}
export type ISongsViewContext = [Omit<ISongsViewState, "filter">, ISongsViewContextActions]
const SongsViewContext = React.createContext<ISongsViewContext | null>(null)
export const useSongsViewContext = () => {
	const value = useContext(SongsViewContext)

	if (!value) {
		throw new Error("useSongsViewContext() hook can only be used insead a SongsView component")
	}

	return value
}

interface ISongsViewProps extends ISongsViewBaseState {
	initialSortOrder?: SortOrder
	initialSortColumn?: string // if not defined will take first column
	filterQuery?: string
	children: (ctx: ISongsViewContext) => any
	filter: SongsFilter
}

export const SongsView: React.FC<ISongsViewProps> = ({ children, filterQuery, filter, ...props }) => {
	const [
		{ songs, columns, sortColumn, sortOrder, hoveredSong, hoveredIdx, currentlyPlayedSong },
		dispatch,
	] = useReducer(songsViewReducer, {
		songs: props.songs,
		columns: props.columns,
		sortOrder: props.initialSortOrder || "ascend",
		sortColumn: props.initialSortColumn || props.columns[0].key,
		hoveredSong: null,
		hoveredIdx: -1,
		currentlyPlayedSong: props.currentlyPlayedSong,
	})

	useEffect(() => {
		dispatch(setCurrentlyPlayedSong(props.currentlyPlayedSong))
	}, [props.currentlyPlayedSong])

	useEffect(() => {
		dispatch(setColumns(props.columns))
	}, [props.columns])

	const filteredAndSortedSongs = useMemo(() => {
		let finalSongList = props.songs

		if (filterQuery) {
			finalSongList = props.songs.filter((song) => filter(filterQuery, song))
		}

		const column = columns.find((column) => column.key === sortColumn)

		if (!column || !isSortableColumn(column)) {
			console.warn(`Cannot order songs, column with key ${sortColumn} not found`)
		} else {
			const renderedSongColumn = finalSongList.map((song, idx) => column.render(song, idx, {} as any))
			const zippedSongs = zip(finalSongList, renderedSongColumn)
			finalSongList = zippedSongs
				.sort((lhs, rhs) => lhs[1]!.localeCompare(rhs[1]!))
				.map((zipped) => zipped[0])
				.filter(filterUndefined)
		}

		if (sortOrder === "descend") {
			finalSongList = [...finalSongList].reverse()
		}

		return finalSongList
	}, [props.songs, filterQuery, filter, sortOrder, sortColumn, columns])

	useDeepCompareEffect(() => {
		dispatch(setSongs(filteredAndSortedSongs))
	}, [filteredAndSortedSongs])

	const contextActions = useMemo(
		(): ISongsViewContextActions => ({
			setHoveredSong: (song, idx) => dispatch(setHoveredSong(song, idx)),
			setOrderCriteria: (column, direction) => dispatch(setOrderCriteria(column, direction)),
		}),
		[dispatch],
	)

	const contextValue = useMemo(
		(): ISongsViewContext => [
			{
				songs,
				columns,
				sortOrder,
				sortColumn,
				hoveredSong,
				hoveredIdx,
				currentlyPlayedSong,
			},
			contextActions,
		],
		[songs, columns, sortOrder, sortColumn, hoveredSong, hoveredIdx, contextActions, currentlyPlayedSong],
	)

	return <SongsViewContext.Provider value={contextValue}>{children(contextValue)}</SongsViewContext.Provider>
}
