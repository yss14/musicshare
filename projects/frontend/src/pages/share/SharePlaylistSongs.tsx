import React, { useState } from 'react';
import { SongTable } from '../../components/SongTable';
import { SongModal } from '../../components/modals/song-modal/SongModal';
import { ISharePlaylistRoute } from '../../interfaces';
import useReactRouter from 'use-react-router';
import { usePlaylist } from '../../graphql/queries/playlist-songs';

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

	const songs = data.share.playlist.songs;

	return (
		<>
			<SongTable songs={songs} onRowClick={onRowClick} />
			{editSongID ? <SongModal songID={editSongID} shareID={shareID} closeForm={() => setEditSongID(null)} /> : null}
		</>
	);
}