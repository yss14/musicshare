import React from 'react';
import { Table } from 'antd';
import { IShareSong, IBaseSong } from '../graphql/types';
import { buildSongName } from '../utils/songname-builder';

const columns = [
	{
		title: "Title",
		width: 200,
		key: "title",
		render: (song: IShareSong) => <a href="#">{buildSongName(song)}</a>
	},
	{
		title: "Artists",
		dataIndex: "artists",
		width: 150,
		key: "artists",
		render: (artists: string[]) =>
			artists.reduce((prev, curr) => prev + ", " + curr)
	},
	{
		title: "Release date",
		dataIndex: "releaseDate",
		width: 100,
		key: "duration",
		render: (releaseDate: string) => releaseDate
	},
	{
		title: "Genres",
		dataIndex: "genres",
		width: 150,
		key: "genres",
		render: (genres: string[]) =>
			genres.reduce((prev, curr) => prev + ", " + curr)
	}
];

interface ISongTableProps {
	songs: IBaseSong[];
	onRowClick: (record: IBaseSong, index: number, event: Event) => void
}

export const SongTable = ({ songs, onRowClick }: ISongTableProps) => (
	<Table
		size="middle"
		columns={columns}
		dataSource={songs}
		pagination={false}
		scroll={{ y: 1242 }}
		onRowClick={onRowClick}
	/>
)