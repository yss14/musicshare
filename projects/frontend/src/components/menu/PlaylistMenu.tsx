import React from 'react';
import { Menu } from "antd";
import { Link } from 'react-router-dom';

const { Item } = Menu;

export const PlaylistMenu = (props: any) => (
	<Item>
		<Link to={`/shares/${1}/playlist`}>Playlist 1</Link>
	</Item>
)