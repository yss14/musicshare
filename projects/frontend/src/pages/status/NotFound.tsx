import React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { useAuthToken } from "../../graphql/client/queries/auth-token-query"

const NotFoundContainer = styled.div`
	width: 100%;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const NotFound = () => {
	const authToken = useAuthToken()

	return (
		<NotFoundContainer>
			<h2>404 Not Found</h2>
			<p></p>
			<Link to={authToken ? "/" : "/login"}>{authToken ? "Go to library" : "Login again"}</Link>
		</NotFoundContainer>
	)
}
