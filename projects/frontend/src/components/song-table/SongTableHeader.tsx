import React from 'react';
import { Typography } from 'antd';
import { IBaseSong, IScopedSong } from '../../graphql/types';
import styled from 'styled-components';
import { formatDuration } from '../../utils/format-duration';
import { SongSearch } from './search/SongSearch';
import { usePlayer } from '../../player/player-hook';
import { useSongUtils } from '../../hooks/use-song-utils';
import { ISongSearchFilter } from './search/search-types';

const { Title, Text } = Typography;

const SongTableHeaderFlexContainer = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	padding: 8px;
	box-sizing: border-box;
	background-color: white;
`;

const MetaInfoContainer = styled.div`
	display: flex;
	flex: 1 1 0px;
	flex-direction: column;
`

interface ISongTableHeaderProps {
	songs: IBaseSong[];
	title: string;
	onSearchFilterChange: (newFilter: ISongSearchFilter) => any;
}

export const SongTableHeader = ({ songs, title, onSearchFilterChange }: ISongTableHeaderProps) => {
	const { changeSong } = usePlayer()
	const { makePlayableSong } = useSongUtils()

	const durationSum = songs.reduce((acc, song) => acc + song.duration, 0);

	const onClickSong = (song: IScopedSong) => {
		console.log(song)
		changeSong(makePlayableSong(song))
	}

	return (
		<SongTableHeaderFlexContainer>
			<MetaInfoContainer>
				<Title level={4} style={{ marginBottom: 0 }}>{title}</Title>
				<Text>{songs.length} songs | {formatDuration(durationSum)}</Text>
			</MetaInfoContainer>
			<SongSearch onClickSong={onClickSong} onSearchFilterChange={onSearchFilterChange} />
		</SongTableHeaderFlexContainer>
	);
}