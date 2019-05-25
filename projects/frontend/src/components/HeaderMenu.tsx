import React, { useState, useEffect, useRef } from "react";
import { Menu, Icon, Spin } from "antd";
import { ClickParam } from "antd/lib/menu";
import styled from "styled-components";
import { Link, withRouter } from "react-router-dom";
import { useShares } from "../graphql/queries/shares-query";

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

  const { data, loading, error } = useShares();
  console.log(data);
  if (error) {
    console.log(error);
    return <div>Error</div>;
  }
  if (loading) {
    return <Spin />;
  }
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
        <ItemGroup key="shares:own" title="Own Shares">
          {data &&
            data.user.shares.map((share, index) => (
              <Menu.Item key={`share:${share.id}`}>
                <Link to={`/shares/${share.id}`}>
                  <Icon type="share-alt" />
                  {share.name}
                </Link>
                )}
              </Menu.Item>
            ))}
        </ItemGroup>
      </SubMenu>
    </Menu>
  );
};

export default NavMenu;
