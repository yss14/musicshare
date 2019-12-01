import React from 'react'
import Lottie, { Options } from 'react-lottie'
import loadingAnimation from '../../images/animations/loading.lottie.json'
import styled from 'styled-components'

const defaultDimension = 100

const AnimationContainer = styled.div<ILoadingSpinnerProps>`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

interface ILoadingSpinnerProps {
	dimension?: number;
}

export const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({ dimension }) => {
	const opts: Options = {
		loop: true,
		autoplay: true,
		animationData: loadingAnimation,
		rendererSettings: {
			preserveAspectRatio: 'xMidYMid slice',
		},
	}

	return (
		<AnimationContainer>
			<Lottie options={opts} width={dimension || defaultDimension} height={dimension || defaultDimension} />
		</AnimationContainer>
	)
}