import React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { useAuth } from "@musicshare/react-graphql-client"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"

const NotFoundContainer = styled.div`
	width: 100%;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const NotFound = () => {
	const { latestData: auth, isLoading } = useAuth()

	if (isLoading) return <LoadingSpinner />

	return (
		<NotFoundContainer>
			<h2>404 Not Found</h2>
			<p></p>
			<Link to={auth?.isLoggedIn ? "/" : "/login"}>{auth?.isLoggedIn ? "Go to library" : "Login again"}</Link>
		</NotFoundContainer>
	)
}
