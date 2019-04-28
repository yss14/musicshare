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
import gql from "graphql-tag";
import { Query } from "react-apollo";
import {
  ILocalUserVariables,
  ILocalShareVariables,
  ILocalShareData,
  ILocalUserData
} from "../resolvers/types.local";
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

interface IUserData {
  userId: string;
}

interface IRouteWrapperProps {
  children: (currentContainer: any) => ReactNode;
}

const GET_SHARE_ID = gql`
  query {
    shareId @client
  }
`;
const GET_USER_ID = gql`
  query {
    userId @client
  }
`;

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
    <Query<ILocalUserData, ILocalUserVariables> query={GET_USER_ID}>
      {localUserQuery => {
        if (localUserQuery.data) {
          return (
            <Query<ILocalShareData, ILocalShareVariables> query={GET_SHARE_ID}>
              {localShareQuery => {
                if (localUserQuery.data && localShareQuery.data) {
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
                        <Dropzone
                          userId={localUserQuery.data.userId}
                          shareId={localShareQuery.data.shareId}
                        >
                          {uploadItems => {
                            /*if ("error") {
				return <div>Error.</div>;
			  }*/
                            const percent =
                              uploadItems.reduce(
                                (prev, curr) => prev + curr.progress,
                                0
                              ) / uploadItems.length;
                            const done = uploadItems.reduce(
                              (prev, curr) =>
                                (prev = curr.status === 2 || curr.status === 3),
                              false
                            );

                            const failed = uploadItems.find(
                              el => el.status === 3
                            );

                            return (
                              <Flex direction="column">
                                {uploadItems.length > 0 ? (
                                  <Box>
                                    <Progress
                                      style={{
                                        padding: 10,
                                        background: "white"
                                      }}
                                      percent={
                                        done
                                          ? 100
                                          : uploadItems.reduce(
                                              (prev, curr) =>
                                                prev + curr.progress,
                                              0
                                            ) / uploadItems.length
                                      }
                                      showInfo={false}
                                      status={
                                        done
                                          ? failed
                                            ? "exception"
                                            : "success"
                                          : "active"
                                      }
                                    />
                                  </Box>
                                ) : null}
                                <Box>
                                  <div
                                    style={{ width: "100%", height: "100%" }}
                                    ref={myRef}
                                  >
                                    {currentContainer &&
                                      children(currentContainer)}
                                  </div>
                                </Box>
                              </Flex>
                            );
                          }}
                        </Dropzone>
                      </StyledContent>
                    </>
                  );
                }
              }}
            </Query>
          );
        }
      }}
    </Query>
  );
};

export default RouteWrapper;
