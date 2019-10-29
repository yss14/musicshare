import React, { useState, useMemo } from "react";
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

interface IPlaylistSongsProps {
	shareID: string;
}

export const PlaylistSongs = ({ shareID }: IPlaylistSongsProps) => {
	const [editSongID, setEditSongID] = useState<string | null>(null);
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

	const onRowClick = (song: IBaseSong, idx: number) => {
		changeSong(makePlayableSong(shareID)(song));

		if (data) {
			const songs = data.share.playlist.songs;
			const followUpSongs = songs.filter((_, songIdx) => songIdx > idx);

			clearQueue();
			enqueueSongs(followUpSongs.map(makePlayableSong(shareID)));
		}
	};

	if (loading) return <Spinner />;
	if (error || !data) return <div>{error}</div>;

	const { songs, id } = data.share.playlist;

	return (
		<>
			<SongTableHeader title={data.share.playlist.name} songs={songs} />
			<SongTable songs={songs} onRowClick={onRowClick} />
			{editSongID ? (
				<SongModal
					songID={editSongID}
					shareID={shareID}
					closeForm={() => setEditSongID(null)}
					playlistID={id}
				/>
			) : null}
		</>
	);
};
