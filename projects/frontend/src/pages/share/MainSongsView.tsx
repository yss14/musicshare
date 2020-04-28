import React, { useState, useCallback } from "react"
import { IScopedSong, IBaseSong } from "../../graphql/types"
import { useSongUtils } from "../../hooks/use-song-utils"
import { usePlayer } from "../../player/player-hook"
import { SongTableHeader } from "../../components/song-table/SongTableHeader"
import { SongTable, IRowEventsArgs } from "../../components/song-table/SongTable"
import { SongModal } from "../../components/modals/song-modal/SongModal"
import { ISongSearchFilter, allMatchingOptions } from "../../components/song-table/search/search-types"
import styled from "styled-components"
import { MoveSong } from "../../components/song-table/MoveSong"
import { ISongTableColumn, SongTableColumn } from "../../components/song-table/SongTableColumns"
import { SongsView } from "../../components/song-table/SongsView"
import { ISongViewSettings } from "../../components/song-table/search/SongViewSettings"

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

interface ISongsViewProps {
	title: string
	songs: IScopedSong[]
	columns: ISongTableColumn[]
	playlistID?: string
	moveSong?: MoveSong
}

export const MainSongsView: React.FC<ISongsViewProps> = ({ title, songs, playlistID, moveSong, columns }) => {
	const { makePlayableSong } = useSongUtils()
	const { changeSong, enqueueSongs, clearQueue, currentSong } = usePlayer()
	const [editSong, setEditSong] = useState<IScopedSong | null>(null)
	const [showSongModal, setShowSongModal] = useState(false)
	const [searchFilter, setSearchFilter] = useState<ISongSearchFilter>({
		mode: "both",
		query: "",
		matcher: allMatchingOptions,
	})
	const [renderedColumns, setRenderedColumns] = useState(columns)

	const onRowClick = useCallback(
		({ song }: IRowEventsArgs) => {
			setEditSong(song)
		},
		[setEditSong],
	)

	const onRowDoubleClick = useCallback(
		({ song, idx, songs }: IRowEventsArgs) => {
			changeSong(makePlayableSong(song))

			if (songs) {
				const followUpSongs = songs.filter((_, songIdx) => songIdx > idx)

				clearQueue()
				enqueueSongs(followUpSongs.map(makePlayableSong))
			}
		},
		[changeSong, makePlayableSong, clearQueue, enqueueSongs],
	)

	const songFilter = useCallback(
		(filterValue: string, song: IBaseSong) => {
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
		const newColumns = Object.values(SongTableColumn).filter((column) =>
			newSettings.columnKeys.includes(column.key),
		)

		setRenderedColumns(newColumns)
	}, [])

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
								rowEvents={{
									onClick: onRowClick,
									onDoubleClick: onRowDoubleClick,
								}}
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
