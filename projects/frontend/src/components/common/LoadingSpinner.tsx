import React, { useMemo } from 'react'
import Lottie, { Options } from 'react-lottie'
import loadingAnimation from '../../images/animations/loading.lottie'
import styled from 'styled-components'
import { ColorType } from '../../types/ColorType'

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
	color?: ColorType;
}

export const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({ dimension, color }) => {
	const finalColor = color || [0.137, 0.137, 0.137, 1]
	const animationData = useMemo(() => loadingAnimation(finalColor), [finalColor])

	const opts: Options = {
		loop: true,
		autoplay: true,
		animationData,
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