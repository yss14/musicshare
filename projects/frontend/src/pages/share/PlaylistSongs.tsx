import React, { useState, useMemo, useRef } from "react";
import { SongTable } from "../../components/song-table/SongTable";
import { SongModal } from "../../components/modals/song-modal/SongModal";
import { ISharePlaylistRoute } from "../../interfaces";
import useReactRouter from "use-react-router";
import { usePlaylist } from "../../graphql/queries/playlist-songs";
import { SongTableHeader } from "../../components/song-table/SongTableHeader";
import { Spinner } from "../../components/Spinner";
import { IBaseSong } from "../../graphql/types";
import { usePlayer } from "../../player/player-hook";
import { useApolloClient } from "@apollo/react-hooks";
import { getSongMediaURL } from "../../graphql/programmatic/get-song-mediaurl";
import { useContextMenu } from "../../components/modals/contextmenu/ContextMenu";
import { SongContextMenu } from "./SongContextMenu";

export interface IPlaylistSongsProps {
	shareID: string;
}

export const PlaylistSongs = ({ shareID }: IPlaylistSongsProps) => {
	const [editSong, setEditSong] = useState<IBaseSong | null>(null);
	const [showSongModal, setShowSongModal] = useState(false)
	const contextMenuRef = useRef<HTMLDivElement>(null)
	const { showContextMenu } = useContextMenu(contextMenuRef)
	const {
		match: {
			params: { playlistID }
		}
	} = useReactRouter<ISharePlaylistRoute>();
	const apolloClient = useApolloClient();
	const fetchSongMediaURL = useMemo(() => getSongMediaURL(apolloClient), [apolloClient]);
	const makePlayableSong = (shareID: string) => (song: IBaseSong) => ({
		...song,
		getMediaURL: () => fetchSongMediaURL(shareID, song.id)
	});

	const { loading, data, error } = usePlaylist({ playlistID, shareID });
	const { changeSong, clearQueue, enqueueSongs } = usePlayer();

	const onRowClick = (event: React.MouseEvent, song: IBaseSong, idx: number) => {
		changeSong(makePlayableSong(shareID)(song));

		if (data) {
			const songs = data.share.playlist.songs;
			const followUpSongs = songs.filter((_, songIdx) => songIdx > idx);

			clearQueue();
			enqueueSongs(followUpSongs.map(makePlayableSong(shareID)));
		}

		setEditSong(song)
		setShowSongModal(true)
	};

	const onRowContextMenu = (event: React.MouseEvent, song: IBaseSong) => {
		setEditSong(song)

		showContextMenu(event)
	}

	if (loading) return <Spinner />;
	if (error) return <div>{error.message}</div>;
	if (!data) return <div>No data</div>

	const { songs, id } = data.share.playlist;

	return (
		<>
			<SongTableHeader title={data.share.playlist.name} songs={songs} />
			<SongTable songs={songs} onRowClick={onRowClick} onRowContextMenu={onRowContextMenu} />
			{editSong && showSongModal ? (
				<SongModal
					songID={editSong.id}
					shareID={shareID}
					closeForm={() => setEditSong(null)}
					playlistID={id}
				/>
			) : null}
			<SongContextMenu song={editSong} ref={contextMenuRef} onShowInformation={() => setShowSongModal(true)} />
		</>
	);
};
