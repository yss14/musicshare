import React, { useState, useMemo, useCallback } from "react"
import { Button, message, Popover } from "antd"
import styled from "styled-components"
import { Link, useRouteMatch } from "react-router-dom"
import { IShareRoute } from "../../interfaces"
import { useSharePlaylists } from "../../graphql/queries/playlists-query"
import { useCreatePlaylist } from "../../graphql/mutations/create-playlist-mutation"
import { Prompt } from "../modals/promt/Prompt"
import { usePlaylistID } from "../../graphql/client/queries/playlistid-query"
import { SidebarItem } from "./SidebarItem"
import { PlaylistSidebarItem } from "./PlaylistSidebarItem"
import { SidebarSection } from "./SidebarSection"
import { useMergedPlaylists } from "../../graphql/queries/merged-playlists-query"
import { IPlaylist } from "../../graphql/types"
import { LoadingSpinner } from "../common/LoadingSpinner"
import { useContextMenu } from "../modals/contextmenu/ContextMenu"
import { PlaylistContextMenu } from "./PlaylistContextMenu"
import Scrollbars from "react-custom-scrollbars"
import { useShares } from "../../graphql/queries/shares-query"

const Sidebar = styled.div`
	width: 200px;
	height: 100%;
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
`

const byPlaylistName = (lhs: IPlaylist, rhs: IPlaylist) => lhs.name.localeCompare(rhs.name)

interface IPlaylistSidebar {
	merged: boolean
}

export const PlaylistSidebar: React.FC<IPlaylistSidebar> = ({ merged }) => {
	return <Sidebar>{merged ? <MergedPlaylistsSidebar /> : <SharePlaylistsSidebar />}</Sidebar>
}

const SharePlaylistsSidebar = () => {
	const {
		params: { shareID },
	} = useRouteMatch<IShareRoute>()!
	const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null)
	const { loading, error, data } = useSharePlaylists({ shareID })
	const [createPlaylist] = useCreatePlaylist({
		onCompleted: ({ createPlaylist: createdPlaylist }) => {
			message.success(`Playlist ${createdPlaylist.name} successfully created`)
		},
	})

	const handleCreatePlaylist = useCallback(() => {
		createPlaylist(shareID, newPlaylistName || "", false)
		setNewPlaylistName(null)
	}, [createPlaylist, shareID, newPlaylistName])

	const addPlaylistButton = useMemo(
		() => (
			<Button type="dashed" size="small" onClick={() => setNewPlaylistName("")}>
				New Playlist
			</Button>
		),
		[setNewPlaylistName],
	)

	const playlists: IPlaylistTargeted[] = useMemo(
		() =>
			(data || [])
				.map((playlist) => ({
					...playlist,
					targetUrl: `/shares/${playlist.shareID}/playlists/${playlist.id}`,
				}))
				.sort(byPlaylistName),
		[data],
	)

	return (
		<>
			<PlaylistSidebarContent
				playlists={playlists}
				targetUrlAllSongs={`/shares/${shareID}`}
				addButton={addPlaylistButton}
				loading={loading}
				error={error ? error.message : undefined}
				isMergedView={false}
			/>
			{newPlaylistName !== null && (
				<Prompt
					title="New Playlist"
					okText="Create"
					onSubmit={handleCreatePlaylist}
					onCancel={() => setNewPlaylistName(null)}
					onChange={(e) => setNewPlaylistName(e.target.value)}
					value={newPlaylistName}
					validationError={newPlaylistName.trim().length === 0 ? "At least one character" : undefined}
				/>
			)}
		</>
	)
}

const ShareButton = styled(Button)`
	margin: 4px 8px;
	width: 130px;
	display: block;
`

const MergedPlaylistsSidebar = () => {
	const { loading, error, data } = useMergedPlaylists()
	const { loading: loadingShares, data: shares } = useShares()

	const [newPlaylistName, setNewPlaylistName] = useState<string | null>(null)
	const [newPlaylistShareID, setNewPlaylistShareID] = useState<string | null>(null)

	const [createPlaylist] = useCreatePlaylist({
		onCompleted: ({ createPlaylist: createdPlaylist }) => {
			message.success(`Playlist ${createdPlaylist.name} successfully created`)
		},
	})

	const handleCreatePlaylist = useCallback(() => {
		if (!newPlaylistShareID) return

		createPlaylist(newPlaylistShareID, newPlaylistName || "", true)
		setNewPlaylistName(null)
	}, [createPlaylist, newPlaylistShareID, newPlaylistName])

	const playlists: IPlaylistTargeted[] = useMemo(
		() =>
			(data || [])
				.map((playlist) => ({
					...playlist,
					targetUrl: `/all/shares/${playlist.shareID}/playlists/${playlist.id}`,
				}))
				.sort(byPlaylistName),
		[data],
	)

	const onClickNewSharePlaylist = useCallback((shareID: string) => {
		setNewPlaylistName("")
		setNewPlaylistShareID(shareID)
	}, [])

	const newPlaylistShareButtons = useMemo(() => {
		if (!shares) return []

		return shares.viewer.shares.map((share) => (
			<ShareButton type="primary" key={share.id} size="small" onClick={() => onClickNewSharePlaylist(share.id)}>
				{share.name}
			</ShareButton>
		))
	}, [shares, onClickNewSharePlaylist])

	const addPlaylistButton = useMemo(
		() => (
			<Popover content={newPlaylistShareButtons} trigger="click">
				<Button type="dashed" size="small" loading={loadingShares}>
					New Playlist
				</Button>
			</Popover>
		),
		[loadingShares, newPlaylistShareButtons],
	)

	return (
		<>
			<PlaylistSidebarContent
				playlists={playlists}
				targetUrlAllSongs="/all"
				addButton={addPlaylistButton}
				loading={loading}
				error={error ? error.message : undefined}
				isMergedView
			/>
			{newPlaylistName !== null && (
				<Prompt
					title="New Playlist"
					okText="Create"
					onSubmit={handleCreatePlaylist}
					onCancel={() => setNewPlaylistName(null)}
					onChange={(e) => setNewPlaylistName(e.target.value)}
					value={newPlaylistName}
					validationError={newPlaylistName.trim().length === 0 ? "At least one character" : undefined}
				/>
			)}
		</>
	)
}

interface IPlaylistTargeted extends IPlaylist {
	targetUrl: string
}

interface IPlaylistSidebarContent {
	playlists: IPlaylistTargeted[]
	targetUrlAllSongs: string
	addButton?: React.ReactElement<any>
	loading: boolean
	error?: string
	isMergedView: boolean
}

const PlaylistSidebarContent: React.FC<IPlaylistSidebarContent> = ({
	playlists,
	targetUrlAllSongs,
	addButton,
	loading,
	error,
	isMergedView,
}) => {
	const playlistID = usePlaylistID()
	const { ref, showContextMenu, isVisible } = useContextMenu()
	const [contextMenuPlaylist, setContextMenuPlaylist] = useState<IPlaylist | null>(null)
	const [searchFilter, setSearchFilter] = useState("")

	const filteredPlaylists = useMemo(() => {
		return playlists.filter((playlist) => playlist.name.toLowerCase().indexOf(searchFilter.toLowerCase()) > -1)
	}, [playlists, searchFilter])

	if (loading === true) {
		return <LoadingSpinner color="#FFFFFF" />
	}

	if (error) {
		return <div>{error}</div>
	}

	return (
		<>
			<SidebarSection title="General">
				<SidebarItem selected={playlistID === null}>
					<Link to={targetUrlAllSongs}>All songs</Link>
				</SidebarItem>
			</SidebarSection>
			<Scrollbars autoHide>
				<SidebarSection
					title="Playlists"
					overflowScroll
					filter={{
						onFilter: setSearchFilter,
						value: searchFilter,
						placeholder: "Filter playlists",
					}}
				>
					{filteredPlaylists.map((playlist) => (
						<PlaylistSidebarItem
							key={playlist.id}
							playlist={playlist}
							selected={playlist.id === playlistID}
							targetUrl={playlist.targetUrl}
							onContextMenu={showContextMenu}
							onMouseEnter={isVisible ? () => undefined : () => setContextMenuPlaylist(playlist)}
						/>
					))}
				</SidebarSection>
			</Scrollbars>
			{addButton && (
				<SidebarButtonContainer style={{ position: "sticky", bottom: 0 }}>{addButton}</SidebarButtonContainer>
			)}
			{contextMenuPlaylist && (
				<PlaylistContextMenu ref={ref} playlist={contextMenuPlaylist} isMergedView={isMergedView} />
			)}
		</>
	)
}
