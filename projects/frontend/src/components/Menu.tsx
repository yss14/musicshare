import React, { useState, useEffect } from "react";
import { Menu, Icon } from "antd";
import { ClickParam } from "antd/lib/menu";
import styled from "styled-components";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const StyledMenu = styled(Menu)`
  position: ${(props: StyleProps) => (props.horizontal ? "" : "fixed")};
  width: ${(props: StyleProps) => (props.horizontal ? "" : "256px")};
  height: ${(props: StyleProps) => (props.horizontal ? "" : "100vh")};
`;

type StyleProps = {
  horizontal?: boolean;
};
interface IMenuProps extends RouteComponentProps<any> {
  horizontal?: boolean;
}

interface IData {
  user: {
    shares: {
      id: string;
      name: string;
      userID: string;
    }[];
  };
}

interface IVariables {
  id: string;
}

const GET_SHARES = gql`
  query user($id: String!) {
    user(id: $id) {
      shares {
        id
        name
        userID
        isLibrary
      }
    }
  }
`;

const NavMenu = ({ horizontal, match, history, location }: IMenuProps) => {
  const [current, setCurrent] = useState("home");

  const handleClick = (e: ClickParam) => {
    setCurrent(e.key);
  };

  useEffect(() => {
    //Make sure the correct menu item gets loaded on refresh. still needs improvement to handle all cases.
    const { pathname } = location;
    if (pathname.includes("/shares")) {
      const split = pathname.split("/");
      if (split.length === 3) {
        setCurrent(`share:${split[2]}`);
      }
    }
  }, []);

  return (
    <Query<IData, IVariables>
      query={GET_SHARES}
      variables={{ id: "f0d8e1f0-aeb1-11e8-a117-43673ffd376b" }}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return <div>Loading ...</div>;
        }
        if (error) {
          return `Error!: ${error}`;
        }
        if (data) {
          return (
            <Menu
              style={{ height: "calc(100% - 64px)", overflow: "auto" }}
              onClick={handleClick}
              selectedKeys={[current]}
              mode={horizontal ? "horizontal" : "inline"}
            >
              <Menu.Item key="home">
                <Icon type="home" />
                <span>
                  <Link to={`/`}>Home</Link>
                </span>
              </Menu.Item>
              <SubMenu
                title={
                  <span className="submenu-title-wrapper">
                    <Icon type="share-alt" /> <span>Shares</span>
                  </span>
                }
              >
                <MenuItemGroup key="shares:own" title="Own Shares">
                  {data.user.shares.map((share, index) => (
                    <Menu.Item key={`share:${share.id}`}>
                      <Link to={`/shares/${share.id}`}>{share.name}</Link>
                    </Menu.Item>
                  ))}
                </MenuItemGroup>
                <MenuItemGroup key="shares:remote" title="Remote Shares">
                  <Menu.Item key="share:3">Share 3</Menu.Item>
                  <Menu.Item key="share:4">Share 4</Menu.Item>
                </MenuItemGroup>
              </SubMenu>
              <SubMenu
                title={
                  <span className="submenu-title-wrapper">
                    <Icon type="profile" /> <span>Library</span>
                  </span>
                }
              >
                <Menu.Item key="5">Option 5</Menu.Item>
                <Menu.Item key="6">Option 6</Menu.Item>
                <SubMenu key="sub3" title="Submenu">
                  <Menu.Item key="7">Option 7</Menu.Item>
                  <Menu.Item key="8">Option 8</Menu.Item>
                </SubMenu>
              </SubMenu>
            </Menu>
          );
        }
      }}
    </Query>
  );
};

export default withRouter(NavMenu);
