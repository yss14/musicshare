import React, { useState } from "react";
import { Menu, Icon, Spin } from "antd";
import styled from "styled-components";
import { Link, useParams, useRouteMatch } from "react-router-dom";
import { useShares } from "../graphql/queries/shares-query";
import { IShareRoute } from "../interfaces";
import { CreateShareModal } from "./modals/CreateShareModal";
import { ShareSettings } from "./modals/share-settings/ShareSettings";
import { IShare } from "../graphql/types";

const { SubMenu, ItemGroup, Item } = Menu;

const StyledIcon = styled(Icon)`
  font-size: 24px;
  font-weight: 600;
`;

const CurrentShareItem = styled(Item)`
	width: 200px;
	font-weight: bold;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`

export const HeaderNavMenu = () => {
	const { shareID } = useParams<IShareRoute>()
	const match = useRouteMatch()
	const { data, loading, error } = useShares();
	const [showCreateShare, setShowCreateShare] = useState(false)
	const [shareSettings, setShareSettings] = useState<IShare | null>(null)
	const [sharesSubmenuHovered, setSharesSubmenuHovered] = useState(false)

	if (loading) {
		return <Spin />;
	}

	if (error || !data) {
		if (error) console.log(error);

		return null;
	}

	const libraryShare = data.viewer.shares.find(share => share.isLibrary)
	const otherShares = data.viewer.shares
		.filter(share => libraryShare === undefined ? false : share.id !== libraryShare.id)
	const currentShareName = (() => {
		if (match) {
			if (!match.path.endsWith('/all')) {
				if (shareID) {
					const currentShare = data.viewer.shares.find(share => share.id === shareID)

					if (currentShare) {
						if (match.path.startsWith('/all/')) {
							return `All - ${currentShare.name}`
						}

						return currentShare.name
					}
				}
			} else {
				return 'All Shares'
			}
		}

		return 'N/A'
	})()

	if (!libraryShare || !otherShares) return null

	const selectedKeys = shareID && match && !match.path.startsWith('/all/') ? `shares:${shareID}` : 'shares:all'

	return (
		<>
			<Menu
				selectedKeys={[selectedKeys]}
				mode="horizontal"
			>
				<CurrentShareItem key="share:current" disabled>
					<span style={{ color: 'black', fontSize: 16 }}>{currentShareName}</span>
				</CurrentShareItem>
				<Item key="shares:all">
					<Link to={`/all`}>
						<StyledIcon type="profile" />
						All
        		</Link>
				</Item>
				<SubMenu
					key="shares:own"
					title={
						<span className="submenu-title-wrapper">
							<StyledIcon type="share-alt" />
							Shares
          				</span>
					}
					style={{ width: sharesSubmenuHovered ? 250 : 140 }}
					onTitleMouseEnter={() => setSharesSubmenuHovered(true)}
					onTitleMouseLeave={() => setSharesSubmenuHovered(false)}
				>
					<ItemGroup key="shares:library" title="Library">
						<Menu.Item key={`shares:${libraryShare.id}`}>
							<Link to={`/shares/${libraryShare.id}`}>
								<Icon type="share-alt" />
								{libraryShare.name}
							</Link>
							)}
              				</Menu.Item>
					</ItemGroup>
					<ItemGroup key="shares:own" title="Own Shares">
						{otherShares.map((share) => (
							<SubMenu key={`shares:${share.id}`} title={
								<Link to={`/shares/${share.id}`}>
									<Icon type="share-alt" />
									<span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>{share.name}</span>
								</Link>
							}>
								<Menu.Item key="share:submenu:edit" onClick={() => setShareSettings(share)}>Settings</Menu.Item>
							</SubMenu>
						))}
					</ItemGroup>
					<ItemGroup key="shares:create" title="Create share">
						<Menu.Item key="shares:create:button" onClick={() => setShowCreateShare(true)}>
							<Icon type="plus" />
							Create share
					</Menu.Item>
					</ItemGroup>
				</SubMenu>
			</Menu>
			{showCreateShare && <CreateShareModal onSubmit={() => setShowCreateShare(false)} onCancel={() => setShowCreateShare(false)} />}
			{shareSettings && <ShareSettings share={shareSettings} onClose={() => setShareSettings(null)} />}
		</>
	);
};
