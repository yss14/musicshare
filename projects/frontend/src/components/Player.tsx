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

const FlexWithStyles = styled(Flex)`
  background: #3a3a3a;
  padding: 8px 4px;
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

type SliderFillProps = Pick<IPlayerSliderProps, 'fillColor'> & { width: number };

const SliderFill = styled.div<SliderFillProps>`
	background-color: ${props => props.fillColor || 'white'};
	width: ${props => props.width}%;
	height: 100%;
`;

type SliderCaptionProps = Pick<IPlayerSliderProps, 'textColor'>

const SliderCaption = styled.div<SliderCaptionProps>`
	position: absolute;
	left: 0;
	right: 0;
	text-align: center;
	color: ${props => props.textColor || '#F8A585'};
	font-size: 12px;
`;

interface IPlayerSliderProps {
	progress: number;
	onClick: (newProgress: number) => unknown;
	fillColor?: string;
	progressText?: string;
	textColor?: string;
}

const PlayerSlider: React.FC<IPlayerSliderProps> = ({ progress, onClick, fillColor, progressText, textColor }) => {
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
			<SliderFill fillColor={fillColor} width={progress * 100} />
		</SliderContainer>
	);
}

export const Player = ({ }) => {
	const { play, pause, next, prev, volume, changeVolume, playing, currentSong, playpackProgress, duration, seek } = usePlayer();

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

	const handleSeek = (newCurrentTimePercentage: number) => {
		console.log({ newCurrentTimePercentage, duration })
		seek(newCurrentTimePercentage * duration);
	}

	return (
		<FlexWithStyles direction="row" align="center">
			<ControlContainer>
				<ControlButton src={controlPrevImg} onClick={prev} />
				<ControlButton src={playing ? controlPauseImg : controlPlayImg} onClick={handleClickPlayPause} />
				<ControlButton src={controlNextImg} onClick={next} />
			</ControlContainer>
			<ProgressBarContainer>
				<PlayerSlider
					progress={playpackProgress}
					progressText={currentSong ? buildSongName(currentSong) : ''}
					onClick={handleSeek}
				/>
			</ProgressBarContainer>
			<ControlContainer>
				<ControlButton src={controlVolumeImg} onClick={handleClickMute} />
				<VolumeSliderContainer>
					<PlayerSlider
						progress={volume}
						onClick={changeVolume}
						progressText={(Math.round(volume * 100) / 100).toString()}
					/>
				</VolumeSliderContainer>
			</ControlContainer>
		</FlexWithStyles>
	);
};
