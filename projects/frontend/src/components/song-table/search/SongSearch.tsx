import React, { useState, useEffect } from 'react'
import { Icon, Input, AutoComplete } from 'antd';
import { useDebounce } from 'use-debounce';
import { useSongSearch } from '../../../graphql/queries/song-search';
import { buildSongName } from '../../../utils/songname-builder';
import styled from 'styled-components';
import { IScopedSong } from '../../../graphql/types';
import { SelectValue } from 'antd/lib/select';
import { usePrevValue } from '../../../hooks/use-prev-value';
import { useDeferedFlag } from '../../../hooks/use-defered-flag';
import { ISongSearchOptions, allMatchingOptions } from './search-types';
import { SongSearchOptionsPopover } from './SongSearchOptionsPopover';

const { Option } = AutoComplete;

const SongSearchContainer = styled.div`
	align-self: flex-end;
	width: 300px;
`

interface ISongSearchProps {
	onClickSong: (song: IScopedSong) => any;
}

export const SongSearch: React.FC<ISongSearchProps> = ({ onClickSong }) => {
	const [searchOptions, setSearchOptions] = useState<ISongSearchOptions>({
		matcher: allMatchingOptions,
		mode: 'both',
	})
	const [query, setQuery] = useState('')
	const [debouncedQuery] = useDebounce(query, 150)
	const prevDebouncedQuery = usePrevValue(debouncedQuery)
	const [isSearching, toggleSearching, resetSearching] = useDeferedFlag(500)
	const { data: songs, loading, error, search } = useSongSearch()

	const onInputChange = (newQuery: string) => setQuery(newQuery)
	const onSelect = (value: SelectValue) => {
		if (!songs || !(typeof value === 'string')) return

		const song = songs.find(song => song.id === value)

		if (song) onClickSong(song)
	}

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

	let options = (songs || []).map(song => (
		<Option key={song.id} value={song.id} title={buildSongName(song)}>
			{buildSongName(song) + ' - ' + song.artists.join(', ')}
		</Option>
	))

	if (options.length === 0 && query.length > 1) {
		options = [
			<Option key="placeholder">
				No songs found
			</Option>
		]
	}

	return (
		<SongSearchContainer>
			<AutoComplete
				dropdownMatchSelectWidth={false}
				dropdownStyle={{ width: 300 }}
				size="default"
				style={{ width: '100%' }}
				dataSource={query.length > 1 ? options : []}
				placeholder="Search songs..."
				optionLabelProp="title"
				onSearch={onInputChange}
				onSelect={onSelect}
				value={query}
			>

				<Input
					suffix={<Icon type={isSearching ? 'loading' : 'search'} className="certain-category-icon" />}
					addonAfter={<SongSearchOptionsPopover onOptionChange={setSearchOptions} />}
				/>
			</AutoComplete>
		</SongSearchContainer>
	)
}
