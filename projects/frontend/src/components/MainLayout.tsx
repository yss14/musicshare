import React from 'react'
import styled from 'styled-components';
import { HeaderNavMenu } from './HeaderMenu';
import { Player } from './Player';

const Layout = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`

const StyledHeader = styled.div`
	background-color: white;
	z-index: 10;
	padding: 0;
	height: 48px;
	width: 100%;
`;

const StyledFooter = styled.div`
	width: 100%;
	z-index: 10;
	height: 48px;
	padding: 0px;
`;

const FlexContent = styled.div`
	flex: 1 1 0px;
	overflow-y: auto;
	display: flex;
	flex-direction: row;
`

const StyledSider = styled.div`
	height: 100%;
	position: relative;
`;

const StyledContent = styled.div`
	background-color: white;
	flex: 1 1 0px;
`;

interface IMainLayoutProps {
	content: React.ReactElement | null;
	sidebarLeft: React.ReactElement | null;
}

export const MainLayout: React.FC<IMainLayoutProps> = ({ sidebarLeft, content }) => (
	<Layout>
		<StyledHeader>
			<HeaderNavMenu />
		</StyledHeader>
		<FlexContent>
			<StyledSider>
				{sidebarLeft}
			</StyledSider>
			<StyledContent>
				{content}
			</StyledContent>
		</FlexContent>
		<StyledFooter>
			<Player />
		</StyledFooter>
	</Layout>
)