import * as React from 'react';
import styled from 'styled-components';
import { ISong } from '../../../redux/shares/shares.schema';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';

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
`;

interface ISongListItemProps extends IStyledComponentProps {
	size: 'small' | 'medium';
	song: ISong;
}

const SongListItemComponent: React.StatelessComponent<ISongListItemProps> = (props) => {
	const height = props.size === 'small' ? 20 : 40;

	return (
		<div className={props.className}>
			<SongListItemColumnStyled height={height}>{props.song.title}</SongListItemColumnStyled>
			<SongListItemColumnStyled height={height} width={50}>05:09</SongListItemColumnStyled>
			<SongListItemColumnStyled height={height} width={150}>{props.song.artists.join(', ')}</SongListItemColumnStyled>
			<SongListItemColumnStyled height={height} width={100}>{props.song.genres.join(', ')}</SongListItemColumnStyled>
		</div>
	);
}

const SongListItemStyled = styled(SongListItemComponent)`
	display: flex;
	flex-direction: row;
	height: ${props => props.size === 'small' ? 20 : 40}px;
	overflow: hidden;
	width: 100%;
`;

export const SongListItem = SongListItemStyled;