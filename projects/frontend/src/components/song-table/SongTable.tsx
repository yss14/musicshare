import React from "react";
import { IScopedSong } from "../../graphql/types";
import { buildSongName } from "../../utils/songname-builder";
import { formatDuration } from "../../utils/format-duration";
import { SongDataTable, IColumn, IRowEvents } from "./SongDataTable";
import { ISongContextMenuEvents } from "../../pages/share/SongContextMenu";
import { MoveSong } from "./MoveSong";

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
	rowEvents: IRowEvents;
	contextMenuEvents: ISongContextMenuEvents;
	moveSong?: MoveSong;
	playlistID?: string;
}

export const SongTable = ({ songs, rowEvents, contextMenuEvents, moveSong, playlistID }: ISongTableProps) => (
	<SongDataTable
		columns={columns}
		songs={songs}
		rowEvents={rowEvents}
		contextMenuEvents={contextMenuEvents}
		moveSong={moveSong}
		playlistID={playlistID}
	/>
)
