import * as React from 'react';
import styled from 'styled-components';
import { IStyledComponentProps } from '../../types/props/StyledComponent.props';
import { bind } from 'bind-decorator';
import { PlayerControls } from './PlayerControls';
import { PlaybackFeedback } from './PlaybackFeedback';

interface IPlayerProps extends IStyledComponentProps {
	dummy?: any; // TODO remove
}

class PlayerComponent extends React.Component<IPlayerProps>{

	@bind
	private onClickPlayPause() {
		//
	}

	@bind
	private onClickPrevNext(next: boolean) {
		//
	}

	public render() {
		const { className } = this.props;

		return (
			<div className={className}>
				<PlayerControls
					isPlaying={false}
					onClickPlayPause={this.onClickPlayPause}
					onClickPrev={this.onClickPrevNext.bind(this, false)}
					onClickNext={this.onClickPrevNext.bind(this, true)}
				/>
				<PlaybackFeedback
					song={undefined}
					onSkip={() => undefined}
					progress={20}
				/>
			</div>
		);
	}
}

const PlayerStyled = styled(PlayerComponent)`
	width: 100%;
	height: 50px;
	background-color: #3a3a3a;
	display: flex;
	flex-direction: row;
`;

export const Player = PlayerStyled;