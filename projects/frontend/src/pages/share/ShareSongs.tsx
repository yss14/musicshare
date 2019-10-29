import React, { useState, useMemo, useEffect } from 'react';
import { ShareWithSongs, GET_SHARE_WITH_SONGS, useShareSongs } from '../../graphql/queries/share-songs-query';
import { SongTable } from '../../components/song-table/SongTable';
import { SongModal } from '../../components/modals/song-modal/SongModal';
import useReactRouter from 'use-react-router';
import { IShareRoute } from '../../interfaces';
import { SongTableHeader } from '../../components/song-table/SongTableHeader';
import { Spinner } from '../../components/Spinner';
import { IBaseSong } from '../../graphql/types';
import { usePlayer } from '../../player/player-hook';
import { getSongMediaURL } from '../../graphql/programmatic/get-song-mediaurl';
import { useApolloClient } from '@apollo/react-hooks';

export const ShareSongs: React.FC = () => {
	const [editSongID, setEditSongID] = useState<string | null>(null);
	const { match: { params: { shareID } } } = useReactRouter<IShareRoute>();
	const { changeSong, enqueueSongs, clearQueue } = usePlayer();
	const apolloClient = useApolloClient();
	const fetchSongMediaURL = useMemo(() => getSongMediaURL(apolloClient), [apolloClient]);
	const makePlayableSong = (shareID: string) => (song: IBaseSong) => ({
		...song,
		getMediaURL: () => fetchSongMediaURL(shareID, song.id)
	});
	const { loading, error, data } = useShareSongs(shareID);

	const onRowClick = (song: IBaseSong, idx: number) => {
		changeSong(makePlayableSong(shareID)(song));

		if (data) {
			const songs = data.share.songs;
			const followUpSongs = songs.filter((_, songIdx) => songIdx > idx);

			clearQueue();
			enqueueSongs(followUpSongs.map(makePlayableSong(shareID)));
		}
	}

	if (loading || !data) {
		return <Spinner />;
	}
	if (error) return <div>`Error!: ${error}`</div>;

	return (
		<>
			<>
				<SongTableHeader title="All songs" songs={data.share.songs} />
				<SongTable songs={data.share.songs} onRowClick={onRowClick} />
			</>
			{editSongID ? <SongModal songID={editSongID} shareID={shareID} closeForm={() => setEditSongID(null)} /> : null}
		</>
	);
}