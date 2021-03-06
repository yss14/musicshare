import React, { useState, useCallback, useMemo } from "react"
import { usePlayerActions, usePlayerQueue } from "../../player/player-hook"
import { SongTableHeader } from "../../components/song-table/SongTableHeader"
import { SongTable, IRowEventsArgs } from "../../components/song-table/SongTable"
import { SongModal } from "../../components/modals/song-modal/SongModal"
import { ISongSearchFilter, allMatchingOptions } from "../../components/song-table/search/search-types"
import styled from "styled-components"
import { MoveSong } from "../../components/song-table/MoveSong"
import { SongTableColumn } from "../../components/song-table/SongTableColumns"
import { SongsView } from "../../components/song-table/SongsView"
import { ISongViewSettings } from "../../components/song-table/search/SongViewSettings"
import { filterUndefined } from "../../utils/filter-null"
import { usePlayerPlaybackState } from "../../components/player/player-state"
import { ShareSong } from "@musicshare/shared-types"

const FlexContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`

const TableContainer = styled.div`
	width: 100%;
	flex: 1 1 0px;
`

const tokenizeQuery = (query: string) =>
	query
		.trim()
		.toLowerCase()
		.replace(/[&/#,+()$~%.'":*?<>{}!]/g, "")
		.split(" ")
		.map((token) => token.trim())
		.filter((token) => token.length > 0)

const mapSongTableColumnKeys = (columnKeys: string[]) =>
	columnKeys.map((key) => Object.values(SongTableColumn).find((column) => column.key === key)).filter(filterUndefined)

interface ISongsViewProps {
	title: string
	songs: ShareSong[]
	playlistID?: string
	moveSong?: MoveSong
	isMergedView: boolean
}

export const MainSongsView: React.FC<ISongsViewProps> = ({ title, songs, playlistID, moveSong, isMergedView }) => {
	const { changeSong } = usePlayerActions()
	const { currentSong } = usePlayerPlaybackState()
	const { enqueueDefaultSongs, clearQueue } = usePlayerQueue()
	const [editSong, setEditSong] = useState<ShareSong | null>(null)
	const [showSongModal, setShowSongModal] = useState(false)
	const [searchFilter, setSearchFilter] = useState<ISongSearchFilter>({
		mode: "both",
		query: "",
		matcher: allMatchingOptions,
	})
	const [customColumns, setCustomColumns] = useState([
		SongTableColumn.Artists,
		SongTableColumn.Time,
		SongTableColumn.Genres,
	]) // will most likely be overriden

	const onRowClick = useCallback(
		({ song }: IRowEventsArgs) => {
			setEditSong(song)
		},
		[setEditSong],
	)

	const onRowDoubleClick = useCallback(
		({ song, idx, songs }: IRowEventsArgs) => {
			changeSong(song)

			if (songs) {
				const followUpSongs = songs.filter((_, songIdx) => songIdx > idx)

				clearQueue()
				enqueueDefaultSongs(followUpSongs)
			}
		},
		[changeSong, clearQueue, enqueueDefaultSongs],
	)

	const songFilter = useCallback(
		(filterValue: string, song: ShareSong) => {
			const tokenizedQuery = tokenizeQuery(filterValue)

			if (tokenizedQuery.length === 0 || searchFilter.mode === "search") return true

			let songTitle = searchFilter.matcher.includes("Title") ? song.title : ""

			if (searchFilter.matcher.includes("Artists")) {
				songTitle += " " + [...song.artists, ...song.remixer, ...song.featurings].join(", ")
			}

			if (searchFilter.matcher.includes("Tags")) {
				songTitle += " " + song.tags.join(", ")
			}

			if (searchFilter.matcher.includes("Genres")) {
				songTitle += " " + song.genres.join(", ")
			}

			if (searchFilter.matcher.includes("Labels")) {
				songTitle += " " + song.labels.join(", ")
			}

			return tokenizedQuery.some((token) => songTitle.toLowerCase().indexOf(token) > -1)
		},
		[searchFilter.mode, searchFilter.matcher],
	)

	const onSongViewSettingsChange = useCallback((newSettings: ISongViewSettings) => {
		const newColumns = mapSongTableColumnKeys(newSettings.columnKeys)

		setCustomColumns(newColumns)
	}, [])

	const renderedColumns = useMemo(() => {
		const fixColumnKeys = playlistID ? ["playback_indicator", "position", "title"] : ["playback_indicator", "title"]

		const mappedSongTableColumns = mapSongTableColumnKeys(fixColumnKeys).concat(customColumns)

		if (isMergedView) {
			mappedSongTableColumns.push(SongTableColumn.Origin)
		}

		return mappedSongTableColumns
	}, [playlistID, customColumns, isMergedView])

	const rowEvents = useMemo(
		() => ({
			onClick: onRowClick,
			onDoubleClick: onRowDoubleClick,
		}),
		[onRowClick, onRowDoubleClick],
	)

	return (
		<FlexContainer>
			<SongsView
				songs={songs}
				columns={renderedColumns}
				filterQuery={searchFilter.query}
				filter={songFilter}
				initialSortColumn={playlistID ? "position" : "title"}
				currentlyPlayedSong={currentSong}
			>
				{([{ songs }]) => (
					<>
						<SongTableHeader
							title={title}
							songs={songs}
							onSearchFilterChange={setSearchFilter}
							onSongViewSettingsChange={onSongViewSettingsChange}
						/>
						<TableContainer>
							<SongTable
								rowEvents={rowEvents}
								contextMenuEvents={{
									onShowInformation: (song) => {
										setEditSong(song)
										setShowSongModal(true)
									},
								}}
								moveSong={moveSong}
								playlistID={playlistID}
							/>
						</TableContainer>
						{editSong && showSongModal ? (
							<SongModal
								song={editSong}
								playlistID={playlistID}
								closeForm={() => setShowSongModal(false)}
							/>
						) : null}
					</>
				)}
			</SongsView>
		</FlexContainer>
	)
}
