import React, { useMemo, useLayoutEffect, useRef } from "react";
import { IInvitationPayload } from "@musicshare/shared-types"
import { AcceptInvitationForm } from "./AcceptInvitationForm";
import { Container, Title } from "../CustomerActionForm";

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
