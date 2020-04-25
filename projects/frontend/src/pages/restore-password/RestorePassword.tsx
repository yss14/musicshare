import React from "react"
import { Container, Title } from "../CustomerActionForm"
import { RestorePasswordForm } from "./RestorePasswordForm"

export const RestorePassword = () => (
	<Container direction="column" justify="center" align="center">
		<Title>Restore Password</Title>
		<RestorePasswordForm />
	</Container>
)
