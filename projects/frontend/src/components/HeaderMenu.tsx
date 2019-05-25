import React, { useState, useEffect, useRef } from "react";
import { Menu, Icon } from "antd";
import { ClickParam } from "antd/lib/menu";
import styled from "styled-components";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link, withRouter } from "react-router-dom";
import { GET_SHARES, ShareQuery } from "../graphql/queries/shares-query";

const { SubMenu, ItemGroup, Item } = Menu;

const StyledIcon = styled(Icon)`
  font-size: 24px;
  font-weight: 600;
`;

const NavMenu = () => {
  const [current, setCurrent] = useState("library");
  const submenuRef = useRef(null);

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
    <ShareQuery query={GET_SHARES}>
      {({ loading, error, data }) => {
        return (
          <Menu
            style={{ marginLeft: "200px" }}
            onClick={handleClick}
            selectedKeys={[current]}
            mode="horizontal"
          >
            <Item key="library">
              <Link to={`/library`}>
                <StyledIcon type="profile" />
                Library
              </Link>
            </Item>
            <SubMenu
              ref={submenuRef}
              key="shares"
              title={
                <span className="submenu-title-wrapper">
                  <StyledIcon type="share-alt" />
                  Shares
                </span>
              }
            >
              {error ? (
                "Error"
              ) : loading ? (
                "Loading"
              ) : data ? (
                <ItemGroup key="shares:own" title="Own Shares">
                  {data.user.shares.map((share, index) => (
                    <Menu.Item key={`share:${share.id}`}>
                      <Link to={`/shares/${share.id}`}>
                        <Icon type="share-alt" />
                        {share.name}
                      </Link>
                      )}
                    </Menu.Item>
                  ))}
                </ItemGroup>
              ) : null}
            </SubMenu>
          </Menu>
        );
      }}
    </ShareQuery>
  );
};

export default withRouter(NavMenu);
