import React, { useState, useMemo } from "react";
import { Button } from "antd";
import styled from "styled-components";
import { Link, useRouteMatch, useHistory } from "react-router-dom";
import { IShareRoute } from "../../interfaces";
import { useSharePlaylists } from "../../graphql/queries/playlists-query";
import { useCreatePlaylist } from "../../graphql/mutations/create-playlist-mutation";
import { Prompt } from "../modals/promt/Prompt";
import { Spinner } from "../Spinner";
import { usePlaylistID } from "../../graphql/client/queries/playlistid-query";
import { SidebarItem } from "./SidebarItem";
import { PlaylistSidebarItem } from "./PlaylistSidebarItem";
import { SidebarSection } from './SidebarSection'
import { useMergedPlaylists } from "../../graphql/queries/merged-playlists-query";
import { IPlaylist } from "../../graphql/types";
import { LoadingSpinner } from "../common/LoadingSpinner";

const Sidebar = styled.div`
	width: 100%;
	height: calc(100% - 48px);
	background-color: #303030;
	box-sizing: border-box;
	padding: 4px 0px;
	display: flex;
	flex-direction: column;
`

const SidebarButtonContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 4px 0px;
`;

const byPlaylistName = (lhs: IPlaylist, rhs: IPlaylist) => lhs.name.localeCompare(rhs.name)

interface IPlaylistSidebar {
	merged: boolean;
}

export const PlaylistSidebar: React.FC<IPlaylistSidebar> = ({ merged }) => {
	return (
		<Sidebar>
			{merged ? <MergedPlaylistsSidebar /> : <SharePlaylistsSidebar />}
		</Sidebar>
	)
}

const SharePlaylistsSidebar = () => {
	const { params: { shareID } } = useRouteMatch<IShareRoute>()!
	const history = useHistory()
	const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null);
	const { loading, error, data } = useSharePlaylists({ shareID });
	const [createPlaylist] = useCreatePlaylist({
		onCompleted: ({ createPlaylist: createdPlaylist }) => {
			history.push(`/shares/${createdPlaylist.shareID}/playlists/${createdPlaylist.id}`)
		},
	});

	const handleCreatePlaylist = () => {
		createPlaylist(shareID, newPlaylistName || "");
		setNewPlaylistName(null);
	};

	const addPlaylistButton = useMemo(() => (
		<Button
			type="dashed"
			size="small"
			onClick={() => setNewPlaylistName("")}
		>
			New Playlist
        </Button>
	), [setNewPlaylistName])

	const playlists: IPlaylistTargeted[] = useMemo(() => (data || [])
		.map(playlist => ({
			...playlist,
			targetUrl: `/shares/${playlist.shareID}/playlists/${playlist.id}`,
		}))
		.sort(byPlaylistName)
		, [data])

	return (
		<>
			<PlaylistSidebarContent
				playlists={playlists}
				targetUrlAllSongs="/all"
				addButton={addPlaylistButton}
				loading={loading}
				error={error ? error.message : undefined}
			/>
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
		</>
	)
};

const MergedPlaylistsSidebar = () => {
	const { loading, error, data } = useMergedPlaylists()

	const playlists: IPlaylistTargeted[] = useMemo(() => (data || [])
		.map(playlist => ({
			...playlist,
			targetUrl: `/all/shares/${playlist.shareID}/playlists/${playlist.id}`,
		}))
		.sort(byPlaylistName)
		, [data])


	return (
		<PlaylistSidebarContent
			playlists={playlists}
			targetUrlAllSongs="/all"
			loading={loading}
			error={error ? error.message : undefined}
		/>
	)
}

interface IPlaylistTargeted extends IPlaylist {
	targetUrl: string;
}

interface IPlaylistSidebarContent {
	playlists: IPlaylistTargeted[];
	targetUrlAllSongs: string;
	addButton?: React.ReactElement<any>;
	loading: boolean;
	error?: string;
}

const PlaylistSidebarContent: React.FC<IPlaylistSidebarContent> = ({ playlists, targetUrlAllSongs, addButton, loading, error }) => {
	const playlistID = usePlaylistID()

	if (loading === true) {
		return <LoadingSpinner color="#FFFFFF" />
	}

	if (error) {
		return <div>error</div>
	}

	return (
		<>
			<SidebarSection title="General">
				<SidebarItem selected={playlistID === null}>
					<Link to={targetUrlAllSongs}>All songs</Link>
				</SidebarItem>
			</SidebarSection>
			<SidebarSection title="Playlists" overflowScroll>
				{playlists.map(playlist => (
					<PlaylistSidebarItem
						key={playlist.id}
						playlist={playlist}
						selected={playlist.id === playlistID}
						targetUrl={playlist.targetUrl}
					/>
				))}
			</SidebarSection>
			{addButton && (
				<SidebarButtonContainer style={{ position: 'sticky', bottom: 0 }}>
					{addButton}
				</SidebarButtonContainer>
			)}
		</>
	)
}