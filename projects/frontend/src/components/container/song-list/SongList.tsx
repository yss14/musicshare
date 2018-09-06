import * as React from 'react';
import * as Infinite from 'react-infinite';
import styled from 'styled-components';
import { ISong } from '../../../redux/shares/shares.schema';
import { SongListItem } from './SongListItem';

interface ISongListProps {
	songs: ISong[];
}

class SongListComponent extends React.Component<ISongListProps>{
	public render() {
		const { songs } = this.props;

		return (
			<Infinite elementHeight={40} containerHeight={800}>
				{
					songs.map(song => (
						<SongListItem song={song} size="small" key={song.id} />
					))
				}
			</Infinite>
		);
	}
}

const SongListStyled = styled(SongListComponent)`
	width: 100%;
	height: 100%;
`;

export const SongList = SongListStyled;