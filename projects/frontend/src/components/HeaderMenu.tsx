import React, { useState, useRef } from "react";
import { Menu, Icon, Spin } from "antd";
import { ClickParam } from "antd/lib/menu";
import styled from "styled-components";
import { Link, useParams } from "react-router-dom";
import { useShares } from "../graphql/queries/shares-query";

const { SubMenu, ItemGroup, Item } = Menu;

const StyledIcon = styled(Icon)`
  font-size: 24px;
  font-weight: 600;
`;

export const HeaderNavMenu = () => {
	const { shareID } = useParams()
	const { data, loading, error } = useShares();
	const [selectedShareID, setShare] = useState<string>(shareID || '');
	const submenuRef = useRef(null);

	const onClickShareItem = (event: ClickParam) => {
		setShare(event.key);
	};

	if (loading) {
		return <Spin />;
	}

	if (error || !data) {
		if (error) console.log(error);

		return null;
	}

	const libraryShare = data.user.shares.find(share => share.isLibrary)

	if (!libraryShare) return null

	const otherShares = data.user.shares.filter(share => share.id !== libraryShare.id)

	return (
		<Menu
			style={{ marginLeft: "200px" }}
			onClick={onClickShareItem}
			selectedKeys={[selectedShareID]}
			mode="horizontal"
		>
			<Item key={libraryShare.id}>
				<Link to={`/all`}>
					<StyledIcon type="profile" />
					All
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
				<ItemGroup key="shares:own" title="Library">
					<Menu.Item key={`share:${libraryShare.id}`}>
						<Link to={`/shares/${libraryShare.id}`}>
							<Icon type="share-alt" />
							{libraryShare.name}
						</Link>
						)}
              				</Menu.Item>
				</ItemGroup>
				<ItemGroup key="shares:own" title="Own Shares">
					{otherShares.map((share) => (
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
