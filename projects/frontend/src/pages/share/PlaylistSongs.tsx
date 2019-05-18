import React, { useState } from 'react';
import { SongTable } from '../../components/song-table/SongTable';
import { SongModal } from '../../components/modals/song-modal/SongModal';
import { ISharePlaylistRoute } from '../../interfaces';
import useReactRouter from 'use-react-router';
import { usePlaylist } from '../../graphql/queries/playlist-songs';
import { SongTableHeader } from '../../components/song-table/SongTableHeader';

interface IPlaylistSongsProps {
	shareID: string;
}

export const PlaylistSongs = ({ shareID }: IPlaylistSongsProps) => {
	const [editSongID, setEditSongID] = useState<string | null>(null);
	const { match: { params: { playlistID } } } = useReactRouter<ISharePlaylistRoute>();
	const { loading, data, error } = usePlaylist({ playlistID, shareID });

	const onRowClick = (song: any) => {
		setEditSongID(song.id);
	}

	if (loading) return <div>Loading...</div>;
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
				/>)
				: null}
		</>
	);
}