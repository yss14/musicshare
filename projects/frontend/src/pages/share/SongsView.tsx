import React, { useRef, useState, useMemo, useCallback } from "react";
import { IScopedSong, IBaseSong } from "../../graphql/types";
import { useContextMenu } from "../../components/modals/contextmenu/ContextMenu";
import { useSongUtils } from "../../hooks/use-song-utils";
import { usePlayer } from "../../player/player-hook";
import { SongTableHeader } from "../../components/song-table/SongTableHeader";
import { SongTable } from "../../components/song-table/SongTable";
import { SongModal } from "../../components/modals/song-modal/SongModal";
import { SongContextMenu } from "./SongContextMenu";
import { ISongSearchFilter, allMatchingOptions } from "../../components/song-table/search/search-types";

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
	playlistID?: string;
}

export const SongsView: React.FC<ISongsViewProps> = ({ title, songs, playlistID }) => {
	const contextMenuRef = useRef<HTMLDivElement>(null)
	const { showContextMenu } = useContextMenu(contextMenuRef)
	const { makePlayableSong } = useSongUtils()
	const { changeSong, enqueueSongs, clearQueue } = usePlayer();
	const [editSong, setEditSong] = useState<IScopedSong | null>(null);
	const [showSongModal, setShowSongModal] = useState(false)
	const [searchFilter, setSearchFilter] = useState<ISongSearchFilter>({
		mode: 'both',
		query: '',
		matcher: allMatchingOptions,
	})

	const onRowClick = (event: React.MouseEvent, song: IScopedSong, idx: number) => {
		changeSong(makePlayableSong(song));

		if (songs) {
			const followUpSongs = songs.filter((_, songIdx) => songIdx > idx);

			clearQueue();
			enqueueSongs(followUpSongs.map(makePlayableSong));
		}

		setEditSong(song)
		setShowSongModal(true)
	}

	const onRowContextMenu = (event: React.MouseEvent, song: IScopedSong) => {
		showContextMenu(event)
		setEditSong(song)
	}

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
		<>
			<SongTableHeader title={title} songs={filteredSongs} onSearchFilterChange={setSearchFilter} />
			<SongTable songs={filteredSongs} onRowClick={onRowClick} onRowContextMenu={onRowContextMenu} />
			{editSong && showSongModal ? (
				<SongModal
					song={editSong}
					playlistID={playlistID}
					closeForm={() => setShowSongModal(false)}
				/>)
				: null}
			<SongContextMenu
				song={editSong}
				playlistID={playlistID}
				ref={contextMenuRef}
				onShowInformation={() => setShowSongModal(true)}
			/>
		</>
	);
}