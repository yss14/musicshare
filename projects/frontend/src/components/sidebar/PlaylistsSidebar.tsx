import React, { useState } from "react";
import { Button } from "antd";
import styled from "styled-components";
import { Link, useRouteMatch } from "react-router-dom";
import { IShareRoute } from "../../interfaces";
import { useSharePlaylists } from "../../graphql/queries/playlists-query";
import { useCreatePlaylist } from "../../graphql/mutations/create-playlist-mutation";
import { Prompt } from "../modals/promt/Prompt";
import { Spinner } from "../Spinner";
import { usePlaylistID } from "../../graphql/client/queries/playlistid-query";
import { SidebarItem } from "./SidebarItem";
import { PlaylistSidebarItem } from "./PlaylistSidebarItem";
import { useMergedPlaylists } from "../../graphql/queries/merged-playlists-query";

const Sidebar = styled.div`
	width: 100%;
	height: 100%;
	background-color: #303030;
	box-sizing: border-box;
	padding: 4px 0px;
`

const SidebarSection = styled.div`
	width: 100%;
	box-sizing: border-box;
	color: grey;
	font-size: 14px;
	padding: 4px 8px 8px 8px;
`

const SidebarButtonContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 4px 0px;
`;

interface IPlaylistSidebar {
	merged: boolean;
}

export const PlaylistSidebar: React.FC<IPlaylistSidebar> = ({ merged }) => {
	if (merged) {
		return <MergedPlaylistsSidebar />;
	} else {
		return <SharePlaylistsSidebar />
	}
}

const SharePlaylistsSidebar = () => {
	const match = useRouteMatch<IShareRoute>()!
	const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null);
	const { shareID } = match.params;
	const playlistID = usePlaylistID()
	const { loading, error, data } = useSharePlaylists({ shareID });
	const [createPlaylist] = useCreatePlaylist({
		shareID,
		name: newPlaylistName || ""
	});

	const handleCreatePlaylist = () => {
		createPlaylist();
		setNewPlaylistName(null);
	};

	if (loading) return <Spinner />;
	if (error || !data) return <div>Error loading playlists</div>;

	return (
		<Sidebar>
			<SidebarSection>General</SidebarSection>
			<SidebarItem selected={playlistID === null}>
				<Link to={`/shares/${shareID}`}>All songs</Link>
			</SidebarItem>
			<SidebarSection>Playlists</SidebarSection>
			{data.share.playlists.map(playlist => (
				<PlaylistSidebarItem
					key={playlist.id}
					playlist={playlist}
					selected={playlist.id === playlistID}
					targetUrl={`/shares/${playlist.shareID}/playlists/${playlist.id}`}
				/>
			))}
			<SidebarButtonContainer>
				<Button
					type="dashed"
					size="small"
					onClick={() => setNewPlaylistName("")}
				>
					New Playlist
         	</Button>
			</SidebarButtonContainer>

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
		</Sidebar>
	);
};

const MergedPlaylistsSidebar = () => {
	const playlistID = usePlaylistID()
	const { loading, error, data } = useMergedPlaylists()

	if (loading) return <Spinner />;
	if (error || !data) return <div>Error loading playlists</div>;

	return (
		<Sidebar>
			<SidebarSection>General</SidebarSection>
			<SidebarItem selected={playlistID === null}>
				<Link to={`/all`}>All songs</Link>
			</SidebarItem>
			<SidebarSection>Playlists</SidebarSection>
			{data.map(playlist => (
				<PlaylistSidebarItem
					key={playlist.id}
					playlist={playlist}
					selected={playlist.id === playlistID}
					targetUrl={`/all/shares/${playlist.shareID}/playlists/${playlist.id}`}
				/>
			))}
		</Sidebar>
	)
}