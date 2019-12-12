import React, { useState, useMemo, useCallback } from "react";
import { IScopedSong, IBaseSong } from "../../graphql/types";
import { useSongUtils } from "../../hooks/use-song-utils";
import { usePlayer } from "../../player/player-hook";
import { SongTableHeader } from "../../components/song-table/SongTableHeader";
import { SongTable } from "../../components/song-table/SongTable";
import { SongModal } from "../../components/modals/song-modal/SongModal";
import { ISongSearchFilter, allMatchingOptions } from "../../components/song-table/search/search-types";
import styled from "styled-components";
import { MoveSong } from "../../components/song-table/MoveSong";
import { SongTableColumn, IColumn } from "../../components/song-table/song-table-columns";

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

const tokenizeQuery = (query: string) => query
	.trim()
	.toLowerCase()
	.replace(/[&/#,+()$~%.'":*?<>{}!]/g, '')
	.split(' ')
	.map(token => token.trim())
	.filter(token => token.length > 0)

interface ISongsViewProps {
	title: string;
	songs: IScopedSong[];
	columns: IColumn[];
	playlistID?: string;
	moveSong?: MoveSong;
}

export const SongsView: React.FC<ISongsViewProps> = ({ title, songs, playlistID, moveSong, columns }) => {
	const { makePlayableSong } = useSongUtils()
	const { changeSong, enqueueSongs, clearQueue } = usePlayer();
	const [editSong, setEditSong] = useState<IScopedSong | null>(null);
	const [showSongModal, setShowSongModal] = useState(false)
	const [searchFilter, setSearchFilter] = useState<ISongSearchFilter>({
		mode: 'both',
		query: '',
		matcher: allMatchingOptions,
	})

	const onRowClick = useCallback((event: React.MouseEvent, song: IScopedSong) => {
		setEditSong(song)
	}, [setEditSong])

	const onRowDoubleClick = useCallback((event: React.MouseEvent, song: IScopedSong, idx: number) => {
		changeSong(makePlayableSong(song));

		if (songs) {
			const followUpSongs = songs.filter((_, songIdx) => songIdx > idx);

			clearQueue();
			enqueueSongs(followUpSongs.map(makePlayableSong));
		}
	}, [changeSong, makePlayableSong, clearQueue, enqueueSongs, songs])

	const songFilter = useCallback((song: IBaseSong) => {
		const { query, mode, matcher } = searchFilter
		const tokenizedQuery = tokenizeQuery(query)

		if (tokenizedQuery.length === 0 || mode === 'search') return true

		let songTitle = matcher.includes('Title') ? song.title : ''

		if (matcher.includes('Artists')) {
			songTitle += ' ' + [...song.artists, ...song.remixer, ...song.featurings].join(', ')
		}

		if (matcher.includes('Tags')) {
			songTitle += ' ' + song.tags.join(', ')
		}

		if (matcher.includes('Genres')) {
			songTitle += ' ' + song.genres.join(', ')
		}

		if (matcher.includes('Labels')) {
			songTitle += ' ' + song.labels.join(', ')
		}

		return tokenizedQuery.some(token => songTitle.toLowerCase().indexOf(token) > -1)
	}, [searchFilter])

	const filteredSongs = useMemo(() => songs.filter(songFilter), [songs, songFilter])

	return (
		<FlexContainer>
			<SongTableHeader title={title} songs={filteredSongs} onSearchFilterChange={setSearchFilter} />
			<TableContainer>
				<SongTable
					songs={filteredSongs}
					columns={columns}
					rowEvents={{
						onClick: onRowClick,
						onDoubleClick: onRowDoubleClick,
					}}
					contextMenuEvents={{
						onShowInformation: (song) => {
							setEditSong(song)
							setShowSongModal(true)
						}
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
				/>)
				: null}
		</FlexContainer>
	);
}