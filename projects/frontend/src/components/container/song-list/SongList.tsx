import * as React from 'react';
import * as Infinite from 'react-infinite';
import styled from 'styled-components';

interface ISongListProps {
	songs: any[];
}

class SongListComponent extends React.Component<ISongListProps>{
	public render() {
		return (
			<Infinite elementHeight={40}>
				<div>Song 1</div>
				<div>Song 2</div>
			</Infinite>
		);
	}
}

const SongListStyled = styled(SongListComponent)`
	width: 100%;
	height: 100%;
`;

export const SongList = SongListStyled;