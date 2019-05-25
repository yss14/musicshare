import React, { useState, useEffect } from "react";
import { Menu, Icon, Affix, Button } from "antd";
import { ClickParam } from "antd/lib/menu";
import styled from "styled-components";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { IShareRoute } from "../../interfaces";
import { usePlaylists } from "../../graphql/queries/playlists-query";
import { sortBy } from "lodash";
import { useCreatePlaylist } from "../../graphql/mutations/create-playlist-mutation";
import { Prompt } from "../modals/promt/Prompt";
import { Spinner } from "../Spinner";

const { SubMenu, Item } = Menu;

const StyledMenu = styled(Menu)`
  height: calc(100% - 64px);
  overflow: auto;
`;

const NavMenu = ({ match, location }: RouteComponentProps<IShareRoute>) => {
  const [current, setCurrent] = useState("home");
  const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null);
  const { shareID } = match.params;

  const { loading, error, data } = usePlaylists({ shareID });
  const [createPlaylist] = useCreatePlaylist({
    shareID,
    name: newPlaylistName || ""
  });

  const handleClick = (e: ClickParam) => {
    setCurrent(e.key);
  };

  const handleCreatePlaylist = () => {
    createPlaylist();
    setNewPlaylistName(null);
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
  }, [location]);

  if (loading) return <Spinner />;
  if (error) return <div>Error loading playlists</div>;

  return (
    <StyledMenu
      onClick={handleClick}
      defaultOpenKeys={["playlists"]}
      selectedKeys={[current]}
      mode={"inline"}
    >
      <Item key="home">
        <Icon type="home" />
        <span>
          <Link to={`/shares/${shareID}`}>Songs</Link>
        </span>
      </Item>
      <SubMenu
        title={
          <span className="submenu-title-wrapper">
            <Icon type="share-alt" /> <span>Playlists</span>
          </span>
        }
        key="playlists"
      >
        {sortBy(data!.share.playlists, "name").map(playlist => (
          <Item key={playlist.id} onClick={e => console.log(e.domEvent)}>
            <Link to={`/shares/${shareID}/playlists/${playlist.id}`}>
              {playlist.name}
            </Link>
          </Item>
        ))}
        <Affix
          offsetBottom={10}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Button
            type="dashed"
            size="small"
            onClick={() => setNewPlaylistName("")}
          >
            New Playlist
          </Button>
        </Affix>
        {newPlaylistName !== null && (
          <Prompt
            title="New Playlist"
            okText="Create"
            onSubmit={handleCreatePlaylist}
            onCancel={() => setNewPlaylistName(null)}
            onChange={e => setNewPlaylistName(e.target.value)}
            value={newPlaylistName}
          />
        )}
      </SubMenu>
    </StyledMenu>
  );
};

export default withRouter(NavMenu);
