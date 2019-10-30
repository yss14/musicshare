import React, { useState, useRef } from 'react';
import { useShareSongs } from '../../graphql/queries/share-songs-query';
import { SongTable } from '../../components/song-table/SongTable';
import { SongModal } from '../../components/modals/song-modal/SongModal';
import useReactRouter from 'use-react-router';
import { IShareRoute } from '../../interfaces';
import { SongTableHeader } from '../../components/song-table/SongTableHeader';
import { Spinner } from '../../components/Spinner';
import { IBaseSong } from '../../graphql/types';
import { usePlayer } from '../../player/player-hook';
import { useContextMenu } from '../../components/modals/contextmenu/ContextMenu';
import { useSongUtils } from '../../hooks/use-song-utils';
import { SongContextMenu } from './SongContextMenu';

export const ShareSongs: React.FC = () => {
	const [editSong, setEditSong] = useState<IBaseSong | null>(null);
	const [showSongModal, setShowSongModal] = useState(false)
	const { match: { params: { shareID } } } = useReactRouter<IShareRoute>();
	const { changeSong, enqueueSongs, clearQueue } = usePlayer();
	const { loading, error, data } = useShareSongs(shareID);
	const contextMenuRef = useRef<HTMLDivElement>(null)
	const { showContextMenu } = useContextMenu(contextMenuRef)
	const { makePlayableSong } = useSongUtils()

	const onRowClick = (event: React.MouseEvent, song: IBaseSong, idx: number) => {
		changeSong(makePlayableSong(shareID)(song));

		if (data) {
			const songs = data.share.songs;
			const followUpSongs = songs.filter((_, songIdx) => songIdx > idx);

			clearQueue();
			enqueueSongs(followUpSongs.map(makePlayableSong(shareID)));
		}

		setEditSong(song)
		setShowSongModal(true)
	}

	const onRowContextMenu = (event: React.MouseEvent, song: IBaseSong) => {
		setEditSong(song)

		showContextMenu(event)
	}

	if (loading || !data) {
		return <Spinner />;
	}
	if (error) return <div>`Error!: ${error}`</div>;

	return (
		<>
			<SongTableHeader title="All songs" songs={data.share.songs} />
			<SongTable songs={data.share.songs} onRowClick={onRowClick} onRowContextMenu={onRowContextMenu} />
			{editSong && showSongModal ? <SongModal songID={editSong.id} shareID={shareID} closeForm={() => setShowSongModal(false)} /> : null}
			<SongContextMenu song={editSong} ref={contextMenuRef} onShowInformation={() => setShowSongModal(true)} />
		</>
	);
}
