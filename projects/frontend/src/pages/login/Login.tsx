import React, { useEffect } from "react"
import { LoginForm } from "./LoginForm"
import { useParams, useHistory } from "react-router-dom"
import { Container, Title } from "../CustomerActionForm"
import styled from "styled-components"
import { useAuth } from "@musicshare/graphql-client"

const BackgroundPane = styled.div`
	background-color: black;
	width: 100%;
	height: 100%;
	position: absolute;
`

const BackgroundImage = styled.div`
	background-image: url(https://musicsharev2.blob.core.windows.net/musicsharestatic/mountain.jpg);
	background-repeat: no-repeat;
	background-size: cover;
	width: 100%;
	height: 100%;
	opacity: 0.5;
	position: absolute;
`

const SloganImage = styled.img`
	width: 500px;
	z-index: 10;
	position: absolute;
	top: 60px;
`

interface ILoginRouteParams {
	email?: string
}

export const Login = () => {
	const { email } = useParams<ILoginRouteParams>()
	const { latestData: auth } = useAuth()
	const history = useHistory()

	useEffect(() => {
		if (auth && auth.isLoggedIn) {
			history.push("/")
		}
	}, [auth, history])

	if (auth && auth.isLoggedIn) return null

	return (
		<>
			<BackgroundPane />
			<BackgroundImage />
			<Container direction="column" justify="center" align="center">
				<SloganImage src="https://musicsharev2.blob.core.windows.net/musicsharestatic/musicshare_slogan.png" />
				<Title style={{ color: "white" }}>Sign In</Title>
				<LoginForm email={email} />
			</Container>
		</>
	)
}
