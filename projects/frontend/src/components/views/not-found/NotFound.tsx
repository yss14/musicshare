import * as React from 'react';
import styled from 'styled-components';

const NotFound = styled.div`
	width: 100%;
	height: 100%;
	padding-top: 100px;
	text-align: center;
	font-size: 30px;
`;

export const NotFoundView: React.StatelessComponent = () => (
	<NotFound>404 Not Found</NotFound>
);