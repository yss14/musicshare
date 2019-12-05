import React, { useRef, useLayoutEffect } from "react";
import { LoginForm } from "./LoginForm";
import { useParams } from "react-router-dom";
import { Container, Title } from "../CustomerActionForm";

interface ILoginRouteParams {
	email?: string;
}

export const Login = () => {
	const titleRef = useRef<HTMLHeadingElement>(null)
	const { email } = useParams<ILoginRouteParams>()

	useLayoutEffect(() => {
		if (titleRef.current) {
			titleRef.current.style.marginTop = `-${titleRef.current.clientHeight / 2}px`
		}
	})

	return (
		<Container direction="column" justify="center" align="center">
			<Title ref={titleRef}>Sign In</Title>
			<LoginForm email={email} />
		</Container>
	)
}
