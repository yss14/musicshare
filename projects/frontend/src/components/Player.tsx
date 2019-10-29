import React, { useRef, useLayoutEffect, useState } from "react";
import { Flex, Box } from "./Flex";
import styled from "styled-components";
import controlPlayImg from '../images/control_play.png';
import controlPauseImg from '../images/control_pause.png';
import controlNextImg from '../images/control_next.png';
import controlPrevImg from '../images/control_prev.png';
import controlVolumeImg from '../images/control_volume.png';
import { usePlayer } from "../player/player-hook";
import { buildSongName } from "../utils/songname-builder";
import { formatDuration } from "../utils/format-duration";

const FlexWithStyles = styled(Flex)`
  background: #3a3a3a;
  padding: 8px 4px;
  height: 100%;
`;

const ControlContainer = styled.div`
	padding: 0px 4px;
	display: flex;
	align-items: center;
`;

const ProgressBarContainer = styled.div`
	flex: 1;
	padding: 0px 4px;
`;

const ControlButton = styled.img`
	width: 30px;
	height: 30px;
	padding: 0px 4px;
	box-sizing: content-box;
	cursor: pointer;
`;

const VolumeSliderContainer = styled.div`
	display: flex;
	width: 200px;
`;

const SliderContainer = styled.div`
	flex: 1;
	border: 1px solid white;
	height: 18px;
	border-radius: 4px;
	position: relative;
	cursor: col-resize;
`;

interface ISliderFillProps {
	fillColor: string;
	width: number
};

const SliderFill = styled.div<ISliderFillProps>`
	background-color: ${props => props.fillColor};
	width: ${props => props.width}%;
	height: 100%;
	position: absolute;
`;

type SliderCaptionProps = Pick<IPlayerSliderProps, 'textColor'>

const SliderCaption = styled.div<SliderCaptionProps>`
	position: absolute;
	left: 0;
	right: 0;
	text-align: center;
	color: ${props => props.textColor || '#F8A585'};
	font-size: 11px;
`;

const SliderCaptionLeft = styled(SliderCaption)`
	text-align: left;
	margin-left: 8px;
`;

const SliderCaptionRight = styled(SliderCaption)`
	text-align: right;
	margin-right: 8px;
`;

interface IProgressOption {
	percentage: number;
	fillColor?: string;
}

interface IPlayerSliderProps {
	progresses: IProgressOption[];
	onClick: (newProgress: number) => unknown;
	progressText?: string;
	textColor?: string;
}

const PlayerSlider: React.FC<IPlayerSliderProps> = ({ progresses, onClick, progressText, textColor, children }) => {
	const sliderContainerRef = useRef<HTMLDivElement>(null);
	const [leftMouseButtonIsClicked, setLeftMouseButtonIsClicked] = useState(false);

	const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!sliderContainerRef.current) return;

		const sliderContainerRect = sliderContainerRef.current.getBoundingClientRect();
		const clickXRelative = e.clientX - sliderContainerRect.left;
		const newProgress = clickXRelative / sliderContainerRef.current.offsetWidth;

		onClick(newProgress);
	}

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (leftMouseButtonIsClicked) {
			handleClick(e);
		}
	}

	return (
		<SliderContainer
			onClick={handleClick}
			onMouseMove={handleMouseMove}
			onMouseDown={(e) => setLeftMouseButtonIsClicked(e.buttons === 1)}
			onMouseUp={() => setLeftMouseButtonIsClicked(false)}
			ref={sliderContainerRef}
		>
			<SliderCaption textColor={textColor}>{progressText}</SliderCaption>
			{
				progresses.map((progress, idx) => (
					<SliderFill fillColor={progress.fillColor || 'white'} width={progress.percentage * 100} key={idx} />
				))
			}
			{children}
		</SliderContainer>
	);
}

export const Player = ({ }) => {
	const { play, pause, next, prev, volume, changeVolume, playing, currentSong, playpackProgress, duration, seek, bufferingProgress } = usePlayer();

	const handleClickMute = () => {
		if (volume <= 0) {
			changeVolume(0.5);
		} else {
			changeVolume(0);
		}
	}

	const handleClickPlayPause = () => {
		if (playing) {
			pause();
		} else {
			play();
		}
	}

	const handleSeek = (newCurrentTimePercentage: number) => seek(newCurrentTimePercentage * duration);

	const playedTime = Math.round(playpackProgress * duration);
	const remainingTime = Math.round(duration - playedTime);

	return (
		<FlexWithStyles direction="row" align="center">
			<ControlContainer>
				<ControlButton src={controlPrevImg} onClick={prev} />
				<ControlButton src={playing ? controlPauseImg : controlPlayImg} onClick={handleClickPlayPause} />
				<ControlButton src={controlNextImg} onClick={next} />
			</ControlContainer>
			<ProgressBarContainer>
				<PlayerSlider
					progresses={[
						{ percentage: playpackProgress },
						{ percentage: bufferingProgress, fillColor: 'rgba(255, 255, 255, 0.1)' },
					]}
					progressText={currentSong
						? `${currentSong.artists.join(', ')} - ${buildSongName(currentSong)}`
						: ''
					}
					onClick={handleSeek}
				>
					<SliderCaptionLeft>{formatDuration(playedTime)}</SliderCaptionLeft>
					<SliderCaptionRight>{formatDuration(remainingTime)}</SliderCaptionRight>
				</PlayerSlider>
			</ProgressBarContainer>
			<ControlContainer>
				<ControlButton src={controlVolumeImg} onClick={handleClickMute} />
				<VolumeSliderContainer>
					<PlayerSlider
						progresses={[{ percentage: volume }]}
						onClick={changeVolume}
						progressText={(Math.round(volume * 100) / 100).toString()}
					/>
				</VolumeSliderContainer>
			</ControlContainer>
		</FlexWithStyles>
	);
};
