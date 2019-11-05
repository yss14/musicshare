import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { IShareSong, IBaseSong, IPlaylist, IScopedSong } from "../../graphql/types";
import { buildSongName } from "../../utils/songname-builder";
import { formatDuration } from "../../utils/format-duration";
import { DragNDropItem } from "../../types/DragNDropItems";
import { useDrag, DragSourceMonitor, DragPreviewImage } from "react-dnd";
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist";
import songDragPreviewImg from '../../images/playlist_add.png'
import { useShareID } from "../../graphql/client/queries/shareid-query";

const columns = [
	{
		title: "Title",
		width: 200,
		key: "title",
		render: (song: IShareSong) => <a href="#">{buildSongName(song)}</a>
	},
	{
		title: "Time",
		width: 100,
		dataIndex: "duration",
		key: "duration",
		render: (duration: number) => formatDuration(duration)
	},
	{
		title: "Artists",
		dataIndex: "artists",
		width: 150,
		key: "artists",
		render: (artists: string[]) =>
			artists.join(', ')
	},
	{
		title: "Genres",
		dataIndex: "genres",
		width: 150,
		key: "genres",
		render: (genres: string[]) =>
			genres.join(', ')
	}
];

interface ISongTableRowProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement> {
	song: IBaseSong;
}

const DragableSongRow = ({ song, ...props }: ISongTableRowProps) => {
	const addSongsToPlaylist = useAddSongsToPlaylist()
	const shareID = useShareID()
	const [, drag, dragPreview] = useDrag({
		item: { type: DragNDropItem.Song, song },
		end: (item: { song: IBaseSong } | undefined, monitor: DragSourceMonitor) => {
			const dragResult = monitor.getDropResult() as { playlist: IPlaylist }

			if (item && dragResult && dragResult.playlist) {
				addSongsToPlaylist(shareID, dragResult.playlist.id, [song.id])
			}
		},
		collect: monitor => ({
			isDragging: monitor.isDragging(),
		}),
	})

	return (<>
		<DragPreviewImage connect={dragPreview} src={songDragPreviewImg} />
		<tr {...props} ref={drag} />
	</>
	)
}

interface ISongTableProps {
	songs: IScopedSong[];
	onRowClick: (event: React.MouseEvent, song: IScopedSong, index: number) => void;
	onRowContextMenu: (event: React.MouseEvent, song: IScopedSong) => void;
}

export const SongTable = ({ songs, onRowClick, onRowContextMenu }: ISongTableProps) => {
	const [height, setHeight] = useState(0);
	const updateDimensions = () => {
		setHeight(window.innerHeight);
	};

	useEffect(() => {
		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, []);

	return (
		<>
			<Table
				size="middle"
				columns={columns}
				dataSource={songs}
				rowKey={(record, index) => "song-key-" + index}
				pagination={false}
				scroll={{ y: height - 210 }}
				onRow={(record: IScopedSong, index) => ({
					onClick: event => onRowClick(event, record, index),
					onContextMenu: event => onRowContextMenu(event, record),
					song: record,
				})}
				components={{ body: { row: DragableSongRow } }}
			/>
		</>
	);
};

