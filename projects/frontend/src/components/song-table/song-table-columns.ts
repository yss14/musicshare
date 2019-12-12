import { IScopedSong, IScopedPlaylistSong, isPlaylistSong } from "../../graphql/types"
import { buildSongName } from "../../utils/songname-builder"
import { formatDuration } from "../../utils/format-duration"
import { useMemo } from "react"

export interface IColumn {
	title: string;
	width: number;
	fixWidth: boolean;
	key: string;
	render: (song: IScopedSong | IScopedPlaylistSong, index: number) => string | number | React.ReactElement<any> | null;
}

type ColumnNames = 'Title' | 'Time' | 'Artists' | 'Genres' | 'Position'

type SongTableColumnMap = {
	[key in ColumnNames]: IColumn;
}

export const SongTableColumn: SongTableColumnMap = {
	Title: {
		title: "Title",
		width: 250,
		fixWidth: false,
		key: "title",
		render: (song) => buildSongName(song),
	},
	Time: {
		title: "Time",
		width: 70,
		fixWidth: true,
		key: "duration",
		render: (song) => formatDuration(song.duration)
	},
	Artists: {
		title: "Artists",
		width: 150,
		fixWidth: false,
		key: "artists",
		render: (song) => song.artists.join(', ')
	},
	Genres: {
		title: "Genres",
		width: 150,
		fixWidth: false,
		key: "genres",
		render: (song) => song.genres.join(', ')
	},
	Position: {
		title: '#',
		width: 24,
		fixWidth: true,
		key: 'position',
		render: (song, idx) => isPlaylistSong(song) ? idx + 1 : null,
	}
}

export type CalculatedColumnWidths = {
	[key in ColumnNames]: string;
}

export const useCalculatedColumnWidths = (columns: IColumn[], containerWidth: number) => {
	const percentageWidthColumns = useMemo(() => columns.filter(col => !col.fixWidth), [columns])
	const fixWidthColumns = useMemo(() => columns.filter(col => col.fixWidth), [columns])

	const hundredPercent = useMemo(
		() => containerWidth - fixWidthColumns.reduce((acc, col) => acc + col.width, 0),
		[containerWidth, fixWidthColumns]
	)
	const accumulatedColumnPercentageWidths = useMemo(
		() => percentageWidthColumns.reduce((acc, col) => acc + col.width, 0),
		[percentageWidthColumns]
	)

	const calculatedWidths = useMemo(() => columns.reduce((obj, col) => {
		if (col.fixWidth) {
			return { ...obj, [col.key]: `${col.width}px` }
		}

		return { ...obj, [col.key]: `${(col.width / accumulatedColumnPercentageWidths) * 100}%` }
	}, {})
		, [columns, accumulatedColumnPercentageWidths, hundredPercent])

	return calculatedWidths as CalculatedColumnWidths
}
