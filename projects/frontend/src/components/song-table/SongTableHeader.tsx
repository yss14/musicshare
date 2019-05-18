import React from 'react';
import { Typography } from 'antd';
import { IBaseSong } from '../../graphql/types';
import styled from 'styled-components';
import { formatDuration } from '../../utils/format-duration';

const { Title, Text } = Typography;

const Wrapper = styled.div`
	width: 100%;
	padding: 8px;
	box-sizing: border-box;
	background-color: white;
`;

interface ISongTableHeaderProps {
	songs: IBaseSong[];
	title: string;
}

export const SongTableHeader = ({ songs, title }: ISongTableHeaderProps) => {
	const durationSum = songs.reduce((acc, song) => acc + song.duration, 0);

	return (
		<Wrapper>
			<Title level={4} style={{ marginBottom: 0 }}>{title}</Title>
			<Text>{songs.length} songs | {formatDuration(durationSum)}</Text>
		</Wrapper>
	);
}