import React, { useState, useEffect, useCallback } from "react"
import { Input } from "antd"
import { useDebounce } from "use-debounce"
import { useSongSearch, useAddSongsToPlaylist } from "@musicshare/react-graphql-client"
import { buildSongName } from "../../../utils/songname-builder"
import styled from "styled-components"
import { ISongSearchOptions, allMatchingOptions, ISongSearchFilter } from "./search-types"
import { SongSearchOptionsPopover } from "./SongSearchOptionsPopover"
import { useDrag, DragSourceMonitor, DragPreviewImage } from "react-dnd"
import { DragNDropItem, ISongDNDItem } from "../../../types/DragNDropItems"
import { useResettingState } from "../../../hooks/use-resetting-state"
import songDragPreviewImg from "../../../images/playlist_add.png"
import { ShareSong, Playlist } from "@musicshare/shared-types"
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons"

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
	box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1);
	margin-top: 8px;
	border-radius: 4px;
`

const SearchResultItem = styled.div`
	width: 100%;
	box-sizing: border-box;
	padding: 4px 6px;

	&:hover {
		background-color: #f0f2f5;
		cursor: pointer;
	}
`

interface ISongSearchProps {
	onClickSong: (song: ShareSong) => any
	onSearchFilterChange: (newFilter: ISongSearchFilter) => any
}

export const SongSearch: React.FC<ISongSearchProps> = ({ onClickSong, onSearchFilterChange }) => {
	const [searchOptions, setSearchOptions] = useState<ISongSearchOptions>({
		matcher: allMatchingOptions,
		mode: "both",
	})
	const [query, setQuery] = useState("")
	const [debouncedQuery] = useDebounce(query, 150)
	const { resolvedData: songs, isFetching } = useSongSearch({
		query: debouncedQuery,
		matcher: searchOptions.matcher,
	})
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

	const onSongClick = useCallback(
		(song: ShareSong) => {
			setIsClickingSong(true)

			onClickSong(song)
		},
		[setIsClickingSong, onClickSong],
	)

	useEffect(() => {
		onSearchFilterChange({ mode: searchOptions.mode, query: debouncedQuery, matcher: searchOptions.matcher })
	}, [searchOptions, debouncedQuery, onSearchFilterChange])

	let options = (songs || []).map((song) => (
		<SongSearchItem key={song.id} song={song} onClick={() => onSongClick(song)} onDrag={setIsDraggingSong} />
	))

	if (options.length === 0 && query.length > 1) {
		options = [<SearchResultItem key="placeholder">No songs found</SearchResultItem>]
	}

	return (
		<SongSearchContainer>
			<Input
				suffix={isFetching ? <LoadingOutlined /> : <SearchOutlined />}
				addonAfter={<SongSearchOptionsPopover onOptionChange={setSearchOptions} />}
				onChange={(e) => setQuery(e.target.value)}
				onFocus={() => setShowResults(true)}
				onBlur={onInputBlur}
			/>
			<SearchResults
				style={{ display: options.length > 0 && showResults && debouncedQuery.length > 1 ? "block" : "none" }}
			>
				{options}
			</SearchResults>
		</SongSearchContainer>
	)
}

interface ISongSearchItemProps {
	song: ShareSong
	onClick: () => any
	onDrag?: (isDragging: boolean) => any
}

const SongSearchItem: React.FC<ISongSearchItemProps> = ({ song, onClick, onDrag }) => {
	const [addSongsToPlaylist] = useAddSongsToPlaylist()
	const [, drag, dragPreview] = useDrag<ISongDNDItem, void, any>({
		item: { type: DragNDropItem.Song, song, idx: -1 },
		begin: () => (onDrag ? onDrag(true) : undefined),
		end: (item: { song: ShareSong } | undefined, monitor: DragSourceMonitor) => {
			if (onDrag) onDrag(false)

			const dragResult = monitor.getDropResult() as { playlist: Playlist }

			if (item && dragResult && dragResult.playlist) {
				addSongsToPlaylist({
					shareID: dragResult.playlist.shareID,
					playlistID: dragResult.playlist.id,
					songIDs: [song.id],
				})
			}
		},
	})

	return (
		<>
			<DragPreviewImage connect={dragPreview} src={songDragPreviewImg} />
			<SearchResultItem onClick={onClick} ref={drag}>
				{buildSongName(song) + " - " + song.artists.join(", ")}
			</SearchResultItem>
		</>
	)
}
