import React, { useState } from "react";
import { Menu, Icon, Spin } from "antd";
import styled from "styled-components";
import { Link, useParams, useRouteMatch } from "react-router-dom";
import { useShares } from "../graphql/queries/shares-query";
import { IShareRoute } from "../interfaces";
import { CreateShareModal } from "./modals/CreateShareModal";

const { SubMenu, ItemGroup, Item } = Menu;

const StyledIcon = styled(Icon)`
  font-size: 24px;
  font-weight: 600;
`;

export const HeaderNavMenu = () => {
	const { shareID } = useParams<IShareRoute>()
	const match = useRouteMatch()
	const { data, loading, error } = useShares();
	const [showCreateShare, setShowCreateShare] = useState(false)
	const [sharesSubmenuHovered, setSharesSubmenuHovered] = useState(false)

	if (loading) {
		return <Spin />;
	}

	if (error || !data) {
		if (error) console.log(error);

		return null;
	}

	const libraryShare = data.viewer.shares.find(share => share.isLibrary)

	if (!libraryShare) return null

	const otherShares = data.viewer.shares.filter(share => share.id !== libraryShare.id)

	const selectedKeys = shareID && match && !match.path.startsWith('/all/') ? `shares:${shareID}` : 'shares:all'

	return (
		<>
			<Menu
				style={{ marginLeft: "200px" }}
				selectedKeys={[selectedKeys]}
				mode="horizontal"
			>
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
								<Menu.Item key="share:submenu:edit">Settings</Menu.Item>
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
		</>
	);
};
