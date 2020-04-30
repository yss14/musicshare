import React, { useMemo } from "react"
import { IScopedSong, IScopedPlaylistSong } from "../../graphql/types"
import { buildSongName } from "../../utils/songname-builder"
import { formatDuration } from "../../utils/format-duration"
import { ISongsViewContext } from "./SongsView"
import styled from "styled-components"
import imgSpeaker from "../../images/song_is_playing_gray.png"
import { Tag } from "antd"
import { padStart } from "lodash"
import moment from "moment"

const CurrentlyPlayingIndicator = styled.div`
	width: 20px;
	height: 20px;
	background-image: url(${imgSpeaker});
	background-repeat: no-repeat;
	background-position: center;
	background-size: 100%;
`

interface IColumnBase {
	title: string
	width: number
	fixWidth: boolean
	key: string
}

interface ISongTableBaseColumn<T> extends IColumnBase {
	render: (song: IScopedSong | IScopedPlaylistSong, index: number, ctx: ISongsViewContext) => T
}

interface ISongTableColumnSortable extends ISongTableBaseColumn<string> {
	sortable: true
}

interface ISongTableColumnNotSortable extends ISongTableBaseColumn<React.ReactElement | null> {
	sortable: false
}

export type ISongTableColumn = ISongTableColumnSortable | ISongTableColumnNotSortable

export interface IColumnRendered extends IColumnBase {
	displayValue: string
}

export const isSortableColumn = (col: ISongTableColumn): col is ISongTableColumnSortable => col.sortable === true

type ColumnNames =
	| "Title"
	| "Time"
	| "Artists"
	| "Genres"
	| "Position"
	| "Indicator"
	| "Tags"
	| "Labels"
	| "ReleaseDate"
	| "DateAdded"
	| "PlayCount"

type SongTableColumnMap = {
	[key in ColumnNames]: ISongTableColumn
}

export const SongTableColumn: SongTableColumnMap = {
	Indicator: {
		title: "",
		width: 22,
		fixWidth: true,
		key: "playback_indicator",
		sortable: false,
		render: (song, _, [{ currentlyPlayedSong }]) => {
			if (currentlyPlayedSong && song.id === currentlyPlayedSong?.id) {
				return <CurrentlyPlayingIndicator />
			}

			return null
		},
	},
	Title: {
		title: "Title",
		width: 250,
		fixWidth: false,
		key: "title",
		sortable: true,
		render: (song) => buildSongName(song),
	},
	Time: {
		title: "Time",
		width: 70,
		fixWidth: true,
		key: "duration",
		sortable: true,
		render: (song) => formatDuration(song.duration),
	},
	Artists: {
		title: "Artists",
		width: 150,
		fixWidth: false,
		key: "artists",
		sortable: true,
		render: (song) => song.artists.join(", "),
	},
	Genres: {
		title: "Genres",
		width: 100,
		fixWidth: false,
		key: "genres",
		sortable: true,
		render: (song) => song.genres.join(", "),
	},
	Position: {
		title: "#",
		width: 40,
		fixWidth: true,
		key: "position",
		sortable: true,
		render: (_, idx) => padStart(String(idx + 1), 3, "0"),
	},
	Tags: {
		title: "Tags",
		width: 150,
		fixWidth: false,
		key: "tags",
		sortable: false,
		render: (song) => (
			<span>
				{song.tags.map((tag, idx) => (
					<Tag key={tag + idx} color="geekblue">
						{tag}
					</Tag>
				))}
			</span>
		),
	},
	Labels: {
		title: "Labels",
		width: 80,
		fixWidth: false,
		key: "labels",
		sortable: false,
		render: (song) => (
			<span>
				{song.labels.map((label, idx) => (
					<Tag key={label + idx} color="green">
						{label}
					</Tag>
				))}
			</span>
		),
	},
	ReleaseDate: {
		title: "Release Date",
		width: 50,
		fixWidth: false,
		key: "release_date",
		sortable: true,
		render: (song) => (song.releaseDate ? moment(song.releaseDate).format("YYYY-MM-DD") : ""),
	},
	DateAdded: {
		title: "Date Added",
		width: 80,
		fixWidth: false,
		key: "date_added",
		sortable: true,
		render: (song) => moment(song.dateAdded).format("YYYY-MM-DD HH:mm"),
	},
	PlayCount: {
		title: "Plays",
		width: 50,
		fixWidth: true,
		key: "play_count",
		sortable: true,
		render: (song) => String(song.playCount || 0),
	},
}

export type CalculatedColumnWidths = {
	[key in ColumnNames]: string
}

export const useCalculatedColumnWidths = (columns: ISongTableColumn[]) => {
	const percentageWidthColumns = useMemo(() => columns.filter((col) => !col.fixWidth), [columns])

	const accumulatedColumnPercentageWidths = useMemo(
		() => percentageWidthColumns.reduce((acc, col) => acc + col.width, 0),
		[percentageWidthColumns],
	)

	const calculatedWidths = useMemo(
		() =>
			columns.reduce((obj, col) => {
				if (col.fixWidth) {
					return { ...obj, [col.key]: `${col.width}px` }
				}

				return { ...obj, [col.key]: `${(col.width / accumulatedColumnPercentageWidths) * 100}%` }
			}, {}),
		[columns, accumulatedColumnPercentageWidths],
	)

	return calculatedWidths as CalculatedColumnWidths
}
