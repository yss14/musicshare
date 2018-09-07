import * as React from 'react';
import * as Infinite from 'react-infinite';
import styled from 'styled-components';
import { ISong } from '../../../redux/shares/shares.schema';
import { SongListItem } from './SongListItem';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';

interface ISongListProps extends IStyledComponentProps {
	songs: ISong[];
}

interface ISongListState {
	divHeight: number;
}

class SongListComponent extends React.Component<ISongListProps, ISongListState>{
	private divRef: HTMLDivElement;

	constructor(props: ISongListProps) {
		super(props);

		this.state = {
			divHeight: null
		}
	}

	public componentDidMount() {
		console.log(this.divRef);
		if (this.divRef) {
			this.setState({
				...this.state,
				divHeight: this.divRef.getBoundingClientRect().height
			});
		}
	}

	public render() {
		const { songs, className } = this.props;
		const { divHeight } = this.state;
		console.log(songs.length);
		console.log('divHeight', divHeight)
		return (
			<div className={className} ref={(ref) => this.divRef = ref}>
				{
					divHeight ? (
						<Infinite elementHeight={20} containerHeight={divHeight}>
							{
								songs.map((song, idx) => (
									<SongListItem
										song={song}
										size="small"
										key={song.id}
										shaded={idx % 2 === 1}
									/>
								))
							}
						</Infinite>
					)
						: null
				}
			</div>
		);
	}
}

const SongListStyled = styled(SongListComponent)`
	width: 100%;
	height: 100%;
	background-color: white;
`;

export const SongList = SongListStyled;