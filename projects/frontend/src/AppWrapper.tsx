import React from "react";
import { Layout } from "antd";
import Routing from "./Routing";
import styled from "styled-components";
import Player from "./components/Player";
import HeaderMenu from "./components/HeaderMenu";

const { Header, Footer } = Layout;

const StyledHeader = styled(Header)`
  position: fixed;
  background-color: ${(props: { theme: any }) => props.theme.lightgrey};
  z-index: 10;
  padding: 0;
  height: 48px;
  width: 100%;
`;

const StyledFooter = styled(Footer)`
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;
  height: 48px;
`;

export default () => {
	return (
		<Layout>
			<StyledHeader>
				<HeaderMenu />
			</StyledHeader>
			<Layout style={{ height: "100vh" }}>
				<Routing />
			</Layout>

			<StyledFooter>
				<Player />
			</StyledFooter>
		</Layout>
	);
};
