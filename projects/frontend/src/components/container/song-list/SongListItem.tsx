import * as React from 'react';
import styled from 'styled-components';
import { ISong } from '../../../redux/shares/shares.schema';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { buildSongName } from '../../../utils/songname-builder';

interface ISongListItemColumnProps extends IStyledComponentProps {
	width?: string | number;
	height: number;
}

const SongListItemColumn: React.StatelessComponent<ISongListItemColumnProps> = ({ className, children }) => (
	<div className={className}>{children}</div>
);

const SongListItemColumnStyled = styled(SongListItemColumn)`
	height: ${props => props.height}px;
	width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width};
	flex: ${props => props.width === undefined ? '1' : undefined};
	font-size: 12px;
	padding: 0px 4px;
`;

interface ISongListItemProps extends IStyledComponentProps {
	size: 'small' | 'medium';
	song: ISong;
	shaded?: boolean;
}

const SongListItemComponent: React.StatelessComponent<ISongListItemProps> = (props) => {
	const { song, size } = props;

	const height = size === 'small' ? 20 : 40;

	return (
		<div className={props.className}>
			<SongListItemColumnStyled height={height}>{buildSongName(song)}</SongListItemColumnStyled>
			<SongListItemColumnStyled height={height} width={50}>05:09</SongListItemColumnStyled>
			<SongListItemColumnStyled height={height} width={150}>{song.artists.join(', ')}</SongListItemColumnStyled>
			<SongListItemColumnStyled height={height} width={100}>{song.genres.join(', ')}</SongListItemColumnStyled>
		</div>
	);
}

const SongListItemStyled = styled(SongListItemComponent)`
	display: flex;
	flex-direction: row;
	height: ${props => props.size === 'small' ? 20 : 40}px;
	overflow: hidden;
	width: 100%;
	background-color: ${props => props.shaded ? '#F0F0F0' : 'white'};
`;

export const SongListItem = SongListItemStyled;