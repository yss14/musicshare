import React, {
  useState,
  ReactNode,
  useRef,
  useEffect,
  MutableRefObject
} from "react";
import { Icon, Layout, Progress } from "antd";
import styled from "styled-components";
import Menu from "./Menu";
import Dropzone from "./Dropzone";
import { Flex, Box } from "./Flex";
const { Sider, Content } = Layout;

const StyledSider = styled(Sider)`
  margin-top: 48px;
  margin-bottom: 48px;
  height: calc(100% - 64px);
  position: fixed;
  z-index: 9;
  left: 0;
`;
const CollapseIcon = styled(Icon)`
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  width: 100%;
  border-right: 1px solid #e8e8e8;
`;

const StyledContent = styled(Content)`
  margin-top: 48px;
  margin-bottom: 48px;
  background-color: ${(props: { collapsed: boolean; theme: any }) =>
    props.theme.lightgrey};
  display: block;
  margin-left: ${(props: { collapsed: boolean; theme: any }) =>
    props.collapsed ? "80px" : "200px"};
`;

interface IRouteWrapperProps {
  children: (currentContainer: any) => ReactNode;
}

const RouteWrapper = ({ children }: IRouteWrapperProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentContainer, setCurrentContainer] = useState<MutableRefObject<
    any
  > | null>(null);
  const toggleCollapse = () => {
    setCollapsed(collapsed => !collapsed);
  };

  const myRef = useRef<any>(null);

  useEffect(() => {
    if (!currentContainer && myRef) {
      setCurrentContainer(myRef);
    }
  });

  return (
    <>
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
        <Dropzone>
          {({ progress, loading, error }) => {
            if (error) {
              return <div>Error.</div>;
            }
            return (
              <Flex direction="column">
                {loading ? (
                  <Box>
                    <Progress
                      style={{ padding: 10, background: "white" }}
                      percent={progress}
                      showInfo={false}
                      status="active"
                    />
                  </Box>
                ) : null}
                <Box>
                  <div style={{ width: "100%", height: "100%" }} ref={myRef}>
                    {currentContainer && children(currentContainer)}
                  </div>
                </Box>
              </Flex>
            );
          }}
        </Dropzone>
      </StyledContent>
    </>
  );
};

export default RouteWrapper;
