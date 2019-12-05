import React, { useMemo, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { Flex } from "../../components/Flex";
import { IInvitationPayload } from "@musicshare/shared-types"
import { AcceptInvitationForm } from "./AcceptInvitationForm";

const Container = styled(Flex)`
  	width: 100%;
  	height: 100%;
  	padding: 20px;
`;

const Title = styled.h1`
	width: 100%;
	text-align: center;
	top: 20%;
	font-size: 44px;
	padding-bottom: 20px;
`

export const AcceptInvitation = () => {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const invitationToken = useMemo(() => window.location.href.split('/invitation/')[1], [])
	const payload = useMemo(() => {
		const payloadEncoded = invitationToken.split('.')[1]
		const payloadDecoded = JSON.parse(atob(payloadEncoded)) as IInvitationPayload

		return payloadDecoded
	}, [invitationToken])

	useLayoutEffect(() => {
		if (titleRef.current) {
			titleRef.current.style.marginTop = `-${titleRef.current.clientHeight / 2}px`
		}
	})

	return (
		<Container direction="column" justify="center" align="center">
			<Title ref={titleRef}>Create Account</Title>
			<AcceptInvitationForm invitationPayload={payload} invitationToken={invitationToken} />
		</Container>
	)
}
