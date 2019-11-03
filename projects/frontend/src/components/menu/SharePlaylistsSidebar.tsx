import React, { useState } from "react";
import { Button } from "antd";
import styled from "styled-components";
import { Link, useRouteMatch } from "react-router-dom";
import { IShareRoute } from "../../interfaces";
import { usePlaylists } from "../../graphql/queries/playlists-query";
import { useCreatePlaylist } from "../../graphql/mutations/create-playlist-mutation";
import { Prompt } from "../modals/promt/Prompt";
import { Spinner } from "../Spinner";
import { useDrop } from 'react-dnd'
import { DragNDropItem } from "../../types/DragNDropItems";
import { IPlaylist } from "../../graphql/types";
import { usePlaylistID } from "../../graphql/client/queries/playlistid-query";

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

interface ISidebarItemProps {
	selected?: boolean;
}

const SidebarItem = styled.div<ISidebarItemProps>`
	&{
		width: 100%;
		padding: 4px 12px;
		box-sizing: border-box;
		background-color: ${props => props.selected ? 'white' : 'transparent'};
	}

	&:hover, &:hover *{
		background-color: ${props => props.selected ? 'white' : '#61676b'};
		color: ${props => props.selected ? 'black' : 'white'};
		cursor: pointer;
	}

	&, & *{
		color: ${props => props.selected ? 'black' : '#b0b5b9'};
		font-size: 15px;
		width: 100%;
	}

	& a{
		display: block;
	}
`

const SidebarButtonContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 4px 0px;
`;

export const SharePlaylistsSidebar = () => {
	const match = useRouteMatch<IShareRoute>()!
	const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null);
	const { shareID } = match.params;
	const playlistID = usePlaylistID()
	const { loading, error, data } = usePlaylists({ shareID });
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
					shareID={shareID}
					playlist={playlist}
					selected={playlist.id === playlistID}
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

interface IPlaylistSidebarItemProps {
	playlist: IPlaylist;
	shareID: string;
	selected: boolean;
}

export const PlaylistSidebarItem: React.FC<IPlaylistSidebarItemProps> = ({ playlist, shareID, selected }) => {
	const [{ canDrop, isOver }, drop] = useDrop({
		accept: DragNDropItem.Song,
		drop: () => ({ playlist }),
		collect: monitor => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	})

	const isOverStyle: React.CSSProperties = {
		backgroundColor: '#61676b',
	}

	return (
		<SidebarItem ref={drop} style={isOver && canDrop ? isOverStyle : {}} selected={selected}>
			<Link to={`/shares/${shareID}/playlists/${playlist.id}`}>
				{playlist.name}
			</Link>
		</SidebarItem>
	)
}
