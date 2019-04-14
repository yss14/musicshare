import React, { useState } from "react";
import { Icon, Layout, Typography } from "antd";
import Routing from "./Routing";
import Menu from "./components/Menu";
import styled from "styled-components";

const { Header, Sider, Footer, Content } = Layout;
const { Paragraph } = Typography;

const StyledHeader = styled(Header)`
  position: fixed;
  background-color: ${(props: { theme: any }) => props.theme.darkgrey};
  z-index: 10;
  width: 100%;
`;

const StyledFooter = styled(Footer)`
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;
  height: 48px;
`;

const CollapseIcon = styled(Icon)`
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  width: 100%;
  border-right: 1px solid #e8e8e8;
`;

const StyledSider = styled(Sider)`
  margin-top: 64px;
  margin-bottom: 48px;
  height: calc(100% - 64px);
  position: fixed;
  z-index: 9;
  left: 0;
`;

const StyledContent = styled(Content)`
  margin-top: 64px;
  margin-bottom: 48px;
  padding: 20px;
  background-color: ${(props: { collapsed: boolean; theme: any }) =>
    props.theme.lightgrey};

  margin-left: ${(props: { collapsed: boolean; theme: any }) =>
    props.collapsed ? "80px" : "200px"};
`;

export default () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => {
    setCollapsed(collapsed => !collapsed);
  };
  return (
    <Layout>
      <StyledHeader>header</StyledHeader>
      <Layout style={{ height: "100vh" }}>
        <StyledSider
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={toggleCollapse}
        >
          <Menu />
          <CollapseIcon
            type={collapsed ? "menu-unfold" : "menu-fold"}
            onClick={toggleCollapse}
          />
        </StyledSider>
        <StyledContent collapsed={collapsed}>
          <Routing />
        </StyledContent>
      </Layout>

      <StyledFooter>
        <Paragraph>Footer</Paragraph>
      </StyledFooter>
    </Layout>
  );
};
