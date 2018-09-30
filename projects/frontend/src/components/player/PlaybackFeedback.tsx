import * as React from 'react';
import styled from 'styled-components';
import { ISong } from '../../redux/shares/shares.schema';
import imgCoverPlaceholder from '../../images/player/cover_placeholder.png';
import { buildSongName } from '../../utils/songname-builder';

const BarWrapper = styled.div`
	position: relative;
	padding: 10px;
	flex: 1;
`;

const BarBackground = styled.div`
	background-color: #5c5c5c;
	border-radius: 4px;
	height: 100%;
	display: flex;
	flex-direction: row;
`;

const Cover = styled.img`
	border-radius: 4px;
	height: 100%;
`;

const ProgressWrapper = styled.div`
	padding: 5px 10px;
	position: relative;
	flex: 1;
`;

const ProgressOutline = styled.div`
	width: 100%;
	height: 100%;
	border: 1px solid white;
	border-radius: 4px;
	position: relative;
`;

const Progress = styled.div`
	background-color: white;
	font-size: 12px;
	height: 100%;
	position: absolute;
`;

const SongInfo = styled.div`
	position: absolute;
	font-size: 12px;
	color: #F8A585;
	width: 100%;
	height: 100%;
	text-align: left;
	padding: 0px 4px;
`;

export interface IPlaybackFeedbackProps {
	song?: ISong;
	progress: number;
	onSkip: (skipTo: number) => void;
}

export class PlaybackFeedback extends React.Component<IPlaybackFeedbackProps>{

	public render() {
		const { progress, song } = this.props;

		const percentage = song ? progress / song.duration : 0;

		return (
			<BarWrapper>
				<BarBackground>
					<Cover src={imgCoverPlaceholder} />
					<ProgressWrapper>
						<ProgressOutline>
							<Progress style={{ width: `${percentage}%` }} />
							<SongInfo>00:00</SongInfo>
							<SongInfo style={{ textAlign: 'center' }}>{song ? buildSongName(song) : 'No title'}</SongInfo>
							<SongInfo style={{ textAlign: 'right' }}>00:00</SongInfo>
						</ProgressOutline>
					</ProgressWrapper>
				</BarBackground>
			</BarWrapper>
		);
	}
}