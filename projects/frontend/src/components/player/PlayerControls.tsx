import * as React from 'react';
import styled from 'styled-components';
import { IStyledComponentProps } from '../../types/props/StyledComponent.props';

import imgControlPlay from '../../images/player/control_play.png';
import imgControlPause from '../../images/player/control_pause.png';
import imgControlPrev from '../../images/player/control_go_back.png';
import imgControlNext from '../../images/player/control_go_forward.png';

const Button = styled.div`
	height: 100%;
	width: 40px;
	background-size: 30px;
	background-repeat: no-repeat;
	background-position: center;
	cursor: pointer;
	display: inline-block;
`;

interface IPlayerControlsProps extends IStyledComponentProps {
	isPlaying: boolean;
	onClickPlayPause: () => void;
	onClickNext: () => void;
	onClickPrev: () => void;
}

const PlayerControlsComponent: React.StatelessComponent<IPlayerControlsProps> = (props) => (
	<div className={props.className}>
		<Button
			style={{ backgroundImage: `url(${imgControlPrev})` }}
			onClick={props.onClickPrev}
		/>
		<Button
			style={{ backgroundImage: `url(${props.isPlaying ? imgControlPause : imgControlPlay})` }}
			onClick={props.onClickPlayPause}
		/>
		<Button
			style={{ backgroundImage: `url(${imgControlNext})` }}
			onClick={props.onClickNext}
		/>
	</div>
);

const PlayerControlsStyled = styled(PlayerControlsComponent)`
	height: 100%;
	padding: 5px;
	width: 160px;
`;

export const PlayerControls = PlayerControlsStyled;