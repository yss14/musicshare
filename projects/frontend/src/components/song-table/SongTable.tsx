import React from "react";
import { IScopedSong } from "../../graphql/types";
import { buildSongName } from "../../utils/songname-builder";
import { formatDuration } from "../../utils/format-duration";
import { SongDataTable, IColumn } from "./SongDataTable";

const columns: IColumn[] = [
	{
		title: "Title",
		width: 250,
		key: "title",
		render: (song) => <span>{buildSongName(song)}</span>
	},
	{
		title: "Time",
		width: 40,
		key: "duration",
		render: (song) => formatDuration(song.duration)
	},
	{
		title: "Artists",
		width: 150,
		key: "artists",
		render: (song) => song.artists.join(', ')
	},
	{
		title: "Genres",
		width: 150,
		key: "genres",
		render: (song) => song.genres.join(', ')
	},
];

interface ISongTableProps {
	songs: IScopedSong[];
	onRowClick: (event: React.MouseEvent, song: IScopedSong, index: number) => void;
	onRowDoubleClick: (event: React.MouseEvent, song: IScopedSong, index: number) => void;
	onRowContextMenu: (event: React.MouseEvent, song: IScopedSong) => void;
}

export const SongTable = ({ songs, onRowClick, onRowContextMenu, onRowDoubleClick }: ISongTableProps) => {
	return (
		<SongDataTable
			columns={columns}
			songs={songs}
			rowEvents={{
				onClick: onRowClick,
				onContextMenu: onRowContextMenu,
				onDoubleClick: onRowDoubleClick,
			}}
		/>
	)
};

