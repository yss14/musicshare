import React, { useState, useEffect, useCallback } from 'react'
import { Icon, Input } from 'antd';
import { useDebounce } from 'use-debounce';
import { useSongSearch } from '../../../graphql/queries/song-search';
import { buildSongName } from '../../../utils/songname-builder';
import styled from 'styled-components';
import { IScopedSong, IBaseSong, IPlaylist } from '../../../graphql/types';
import { usePrevValue } from '../../../hooks/use-prev-value';
import { useDeferedFlag } from '../../../hooks/use-defered-flag';
import { ISongSearchOptions, allMatchingOptions, ISongSearchFilter } from './search-types';
import { SongSearchOptionsPopover } from './SongSearchOptionsPopover';
import { useDrag, DragSourceMonitor, DragPreviewImage } from 'react-dnd';
import { DragNDropItem } from '../../../types/DragNDropItems';
import { useResettingState } from '../../../hooks/use-resetting-state';
import { useAddSongsToPlaylist } from '../../../graphql/mutations/add-songs-to-playlist';
import songDragPreviewImg from '../../../images/playlist_add.png'

const SongSearchContainer = styled.div`
	align-self: flex-end;
	width: 300px;
	position: relative;
`

const SearchResults = styled.div`
	width: 100%;
	box-sizing: border-box;
	position: absolute;
	background-color: white;
	z-index: 10;
	box-shadow: 0 4px 15px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .1);
	margin-top: 8px;
	border-radius: 4px;
`

const SearchResultItem = styled.div`
	width: 100%;
	box-sizing: border-box;
	padding: 4px 6px;

	&:hover{
		background-color: #f0f2f5;
		cursor: pointer;
	}
`

interface ISongSearchProps {
	onClickSong: (song: IScopedSong) => any;
	onSearchFilterChange: (newFilter: ISongSearchFilter) => any;
}

export const SongSearch: React.FC<ISongSearchProps> = ({ onClickSong, onSearchFilterChange }) => {
	const [searchOptions, setSearchOptions] = useState<ISongSearchOptions>({
		matcher: allMatchingOptions,
		mode: 'both',
	})
	const [query, setQuery] = useState('')
	const [debouncedQuery] = useDebounce(query, 150)
	const prevDebouncedQuery = usePrevValue(debouncedQuery)
	const [isSearching, toggleSearching, resetSearching] = useDeferedFlag(500)
	const { data: songs, loading, search } = useSongSearch()
	const [showResults, setShowResults] = useState(false)
	const [isDraggingSong, setIsDraggingSong] = useState(false)
	const [isClickingSong, setIsClickingSong] = useResettingState(false, 1000)

	const onInputBlur = useCallback(() => {
		setTimeout(() => {
			if (!isDraggingSong && !isClickingSong) {
				setShowResults(false)
			}
		}, 100)
	}, [isDraggingSong, isClickingSong, setShowResults])

	const onSongClick = useCallback((song: IScopedSong) => {
		setIsClickingSong(true)

		onClickSong(song)
	}, [setIsClickingSong, onClickSong])

	useEffect(() => {
		if (debouncedQuery) {
			search(debouncedQuery, searchOptions.matcher)
			toggleSearching()
		}
	}, [debouncedQuery, prevDebouncedQuery, searchOptions.matcher])

	useEffect(() => {
		if (!loading) {
			resetSearching()
		}
	}, [loading])

	useEffect(() => {
		onSearchFilterChange({ mode: searchOptions.mode, query: debouncedQuery, matcher: searchOptions.matcher })
	}, [searchOptions, debouncedQuery])

	let options = (songs || []).map(song => (
		<SongSearchItem
			key={song.id}
			song={song}
			onClick={() => onSongClick(song)}
			onDrag={setIsDraggingSong}
		/>
	))

	if (options.length === 0 && query.length > 1) {
		options = [
			<SearchResultItem key="placeholder">
				No songs found
			</SearchResultItem>
		]
	}

	return (
		<SongSearchContainer>
			<Input
				suffix={<Icon type={isSearching ? 'loading' : 'search'} className="certain-category-icon" />}
				addonAfter={<SongSearchOptionsPopover onOptionChange={setSearchOptions} />}
				onChange={e => setQuery(e.target.value)}
				onFocus={() => setShowResults(true)}
				onBlur={onInputBlur}
			/>
			<SearchResults style={{ display: options.length > 0 && showResults && debouncedQuery.length > 1 ? 'block' : 'none' }}>
				{options}
			</SearchResults>
		</SongSearchContainer>
	)
}

interface ISongSearchItemProps {
	song: IScopedSong;
	onClick: () => any;
	onDrag?: (isDragging: boolean) => any;
}

const SongSearchItem: React.FC<ISongSearchItemProps> = ({ song, onClick, onDrag }) => {
	const addSongsToPlaylist = useAddSongsToPlaylist()
	const [, drag, dragPreview] = useDrag({
		item: { type: DragNDropItem.Song, song },
		begin: () => onDrag ? onDrag(true) : undefined,
		end: (item: { song: IBaseSong } | undefined, monitor: DragSourceMonitor) => {
			if (onDrag) onDrag(false)

			const dragResult = monitor.getDropResult() as { playlist: IPlaylist }

			if (item && dragResult && dragResult.playlist) {
				addSongsToPlaylist(dragResult.playlist.shareID, dragResult.playlist.id, [song.id])
			}
		},
	})

	return (
		<>
			<DragPreviewImage connect={dragPreview} src={songDragPreviewImg} />
			<SearchResultItem onClick={onClick} ref={drag}>
				{buildSongName(song) + ' - ' + song.artists.join(', ')}
			</SearchResultItem>
		</>
	)
}
