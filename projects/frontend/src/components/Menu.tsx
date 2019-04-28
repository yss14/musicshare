import React, { useState, useEffect } from "react";
import { Menu, Icon, Typography } from "antd";
import { ClickParam } from "antd/lib/menu";
import styled from "styled-components";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { IRouteParams } from "../interfaces";

const { SubMenu, ItemGroup, Item } = Menu;
const { Title } = Typography;

const StyledMenu = styled(Menu)`
  height: calc(100% - 64px);
  overflow: auto;
`;

const NavMenu = ({
  match,
  history,
  location
}: RouteComponentProps<IRouteParams>) => {
  const [current, setCurrent] = useState("home");
  const { id } = match.params;

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
    <StyledMenu onClick={handleClick} selectedKeys={[current]} mode={"inline"}>
      <Item key="home">
        <Icon type="home" />
        <span>
          <Link to={`/shares/${id}`}>Songs</Link>
        </span>
      </Item>
      <SubMenu
        title={
          <span className="submenu-title-wrapper">
            <Icon type="share-alt" /> <span>Playlists</span>
          </span>
        }
      >
        <ItemGroup key="playlists:own" title="Own Playlists">
          <Item key="share:3">
            <Link to={`/shares/${id}/playlist`}>Playlist 1</Link>
          </Item>
          <Item key="share:4">
            <Link to={`/shares/${id}/playlist`}>Playlist 2</Link>
          </Item>
        </ItemGroup>
        <ItemGroup key="playlists:remote" title="Remote Playlists">
          <Item key="share:3">Playlist 3</Item>
          <Item key="share:4">Playlist 4</Item>
        </ItemGroup>
      </SubMenu>
      <SubMenu
        title={
          <span className="submenu-title-wrapper">
            <Icon type="profile" /> <span>Artists</span>
          </span>
        }
      >
        <Item key="5">Option 5</Item>
        <Item key="6">Option 6</Item>
      </SubMenu>
      <SubMenu
        title={
          <span className="submenu-title-wrapper">
            <Icon type="profile" /> <span>Albums</span>
          </span>
        }
      >
        <Item key="5">Option 5</Item>
        <Item key="6">Option 6</Item>
      </SubMenu>

      <SubMenu
        title={
          <span className="submenu-title-wrapper">
            <Icon type="profile" /> <span>Genres</span>
          </span>
        }
      >
        <Item key="5">Option 5</Item>
        <Item key="6">Option 6</Item>
      </SubMenu>
    </StyledMenu>
  );
};

export default withRouter(NavMenu);
