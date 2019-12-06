import React, { useMemo } from "react";
import { IInvitationPayload } from "@musicshare/shared-types"
import { AcceptInvitationForm } from "./AcceptInvitationForm";
import { Container, Title } from "../CustomerActionForm";

export const AcceptInvitation = () => {
	const invitationToken = useMemo(() => window.location.href.split('/invitation/')[1], [])
	const payload = useMemo(() => {
		const payloadEncoded = invitationToken.split('.')[1]
		const payloadDecoded = JSON.parse(atob(payloadEncoded)) as IInvitationPayload

		return payloadDecoded
	}, [invitationToken])

	return (
		<Container direction="column" justify="center" align="center">
			<Title>Create Account</Title>
			<AcceptInvitationForm invitationPayload={payload} invitationToken={invitationToken} />
		</Container>
	)
}
