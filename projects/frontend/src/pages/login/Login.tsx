import React, { useRef, useLayoutEffect, useEffect } from "react";
import { LoginForm } from "./LoginForm";
import { useParams, useHistory } from "react-router-dom";
import { Container, Title } from "../CustomerActionForm";
import { useAuthToken } from "../../graphql/client/queries/auth-token-query";

interface ILoginRouteParams {
	email?: string;
}

export const Login = () => {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const { email } = useParams<ILoginRouteParams>()
	const authToken = useAuthToken()
	const history = useHistory()

	useEffect(() => {
		if (authToken) {
			history.push('/')
		}
	}, [authToken, history])

	useLayoutEffect(() => {
		if (titleRef.current) {
			titleRef.current.style.marginTop = `-${titleRef.current.clientHeight / 2}px`
		}
	})

	if (authToken) return null

	return (
		<Container direction="column" justify="center" align="center">
			<Title ref={titleRef}>Sign In</Title>
			<LoginForm email={email} />
		</Container>
	)
}
