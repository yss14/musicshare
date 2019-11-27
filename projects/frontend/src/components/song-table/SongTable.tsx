import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table } from "antd";
import { IShareSong, IPlaylist, IScopedSong } from "../../graphql/types";
import { buildSongName } from "../../utils/songname-builder";
import { formatDuration } from "../../utils/format-duration";
import { DragNDropItem } from "../../types/DragNDropItems";
import { useDrag, DragSourceMonitor, DragPreviewImage, DragElementWrapper, DragPreviewOptions } from "react-dnd";
import { useAddSongsToPlaylist } from "../../graphql/mutations/add-songs-to-playlist";
import { setComponents, VTComponents } from 'virtualizedtableforantd'
import songDragPreviewImg from '../../images/playlist_add.png'
import styled from "styled-components";
import { isMutableRef } from "../../types/isMutableRef";

const columns = [
	{
		title: "Title",
		width: 250,
		key: "title",
		render: (song: IShareSong) => <span>{buildSongName(song)}</span>
	},
	{
		title: "Time",
		width: 40,
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

const CustomTHElement = styled.th`
	padding: 4px 6px !important;
    border-top: 1px solid #dcdcdc;
    border-bottom: 1px solid #dcdcdc !important;
`

const CustomTRElement = styled.tr`
	& > td{
		padding: 3px 6px !important;
	}
`

interface ISongTableRowProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement> {
	song: IScopedSong;
	handleSongHover: (song: IScopedSong, ref: React.Ref<HTMLTableRowElement>) => void;
	dragPreview: DragElementWrapper<DragPreviewOptions>;
}

const DragableSongRow = React.forwardRef<HTMLTableRowElement, ISongTableRowProps>(({ song, handleSongHover, dragPreview, children, ...props }, ref) => (
	<CustomTRElement {...props} ref={ref} onMouseEnter={() => handleSongHover(song, ref)}>
		<DragPreviewImage connect={dragPreview} src={songDragPreviewImg} />
		{children}
	</CustomTRElement>
))

interface ISongTableProps {
	songs: IScopedSong[];
	onRowClick: (event: React.MouseEvent, song: IScopedSong, index: number) => void;
	onRowDoubleClick: (event: React.MouseEvent, song: IScopedSong, index: number) => void;
	onRowContextMenu: (event: React.MouseEvent, song: IScopedSong) => void;
}

export const SongTable = ({ songs, onRowClick, onRowContextMenu, onRowDoubleClick }: ISongTableProps) => {
	const [height, setHeight] = useState(0);
	const updateDimensions = useCallback(() => {
		setHeight(window.innerHeight);
	}, [setHeight])

	const [hoveredSong, setHoveredSong] = useState<IScopedSong>()
	const addSongsToPlaylist = useAddSongsToPlaylist()
	const [, drag, dragPreview] = useDrag({
		item: { type: DragNDropItem.Song, song: hoveredSong },
		end: (item: { song: IScopedSong } | undefined, monitor: DragSourceMonitor) => {
			const dragResult = monitor.getDropResult() as { playlist: IPlaylist }

			if (item && dragResult && dragResult.playlist && item.song) {
				addSongsToPlaylist(dragResult.playlist.shareID, dragResult.playlist.id, [item.song.id])
			}
		},
	})

	const onSongHovered = useCallback((song: IScopedSong, ref: React.Ref<HTMLTableRowElement>) => {
		setHoveredSong(song)

		if (isMutableRef(ref)) {
			drag(ref.current)
		}
	}, [setHoveredSong, drag])

	useEffect(() => {
		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		setComponents(1000, {
			header: {
				cell: CustomTHElement,
			},
			body: {
				row: DragableSongRow,
			}
		})

		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, [updateDimensions]);

	const table = useMemo(() => (
		<Table
			size="middle"
			columns={columns}
			dataSource={songs}
			rowKey={(song, idx) => "song-key-" + song.id + "-" + idx}
			pagination={false}
			scroll={{ y: height - 192 }}
			onRow={(record: IScopedSong, index) => ({
				onClick: event => onRowClick(event, record, index),
				onContextMenu: event => onRowContextMenu(event, record),
				onDoubleClick: event => onRowDoubleClick(event, record, index),
				song: record,
				handleSongHover: onSongHovered,
				dragPreview,
			})}
			components={VTComponents({ id: 1000 })}
		/>
	), [songs, onSongHovered, height, dragPreview, onRowClick, onRowContextMenu, onRowDoubleClick])

	return table
};

