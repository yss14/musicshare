import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom';

const NotFoundContainer = styled.div`
	width: 100%;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

export const NotFound = () => (
	<NotFoundContainer>
		<h2>404 Not Found</h2>
		<p></p>
		<Link to="/">Go to library</Link>
	</NotFoundContainer>
)
