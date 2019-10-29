import React from 'react'
import { Icon, Layout, Progress } from "antd";
import styled from 'styled-components';
import { HeaderNavMenu } from './HeaderMenu';
import { Player } from './Player';

const { Header, Footer, Sider, Content } = Layout;

const StyledHeader = styled(Header)`
	&&& {
		position: fixed;
		background-color: white;
		z-index: 10;
		padding: 0;
		height: 48px;
		width: 100%;
	}
`;

const StyledSider = styled(Sider)`
	&&& {
		margin-top: 48px;
		margin-bottom: 48px;
		height: 100%;
		position: fixed;
		z-index: 9;
		left: 0;
	}
`;

const StyledContent = styled(Content)`
	&&&{
		margin-top: 48px;
		margin-bottom: 48px;
		background-color: ${props => props.theme.lightgrey};
		display: block;
		margin-left: 200px;
	}
`;

const StyledFooter = styled(Footer)`
  	&&&{
		position: fixed;
		bottom: 0px;
		width: 100%;
		z-index: 10;
		height: 48px;
		padding: 0px;
	  }
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
		<StyledSider
			collapsible
			collapsed={false}
		>
			{sidebarLeft}
		</StyledSider>
		<StyledContent>
			{content}
		</StyledContent>
		<StyledFooter>
			<Player />
		</StyledFooter>
	</Layout>
)