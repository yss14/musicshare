import React, { useRef, useLayoutEffect } from "react"
import styled from "styled-components"
import { Flex } from "../components/Flex"

export const Container = styled(Flex)`
	width: 100%;
	height: 100%;
	padding: 20px;
`

export const StyledTitle = styled.h1`
	width: 100%;
	text-align: center;
	top: 20%;
	font-size: 44px;
	padding-bottom: 20px;
`

export const Title: React.FC = ({ children }) => {
	const titleRef = useRef<HTMLHeadingElement>(null)

	useLayoutEffect(() => {
		if (titleRef.current) {
			titleRef.current.style.marginTop = `-${titleRef.current.clientHeight / 2}px`
		}
	})

	return <StyledTitle ref={titleRef}>{children}</StyledTitle>
}
