import React, { useState, useMemo } from 'react';
import { ShareWithSongs, GET_SHARE_WITH_SONGS } from '../../graphql/queries/share-songs-query';
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

export const ShareSongs = () => {
	const [editSongID, setEditSongID] = useState<string | null>(null);
	const { match: { params: { shareID } } } = useReactRouter<IShareRoute>();
	const { changeSong } = usePlayer();
	const apolloClient = useApolloClient();
	const fetchSongMediaURL = useMemo(() => getSongMediaURL(apolloClient), [apolloClient]);

	const onRowClick = (song: IBaseSong) => {
		changeSong({
			...song,
			getMediaURL: () => fetchSongMediaURL(shareID, song.id)
		});
	}

	return (
		<>
			<ShareWithSongs query={GET_SHARE_WITH_SONGS} variables={{ shareID }}>
				{({ loading, error, data }) => {
					if (loading) {
						return <Spinner />;
					}
					if (error) return `Error!: ${error}`;
					if (data) {
						return (
							<>
								<SongTableHeader title="All songs" songs={data.share.songs} />
								<SongTable songs={data.share.songs} onRowClick={onRowClick} />
							</>
						);
					}
				}}
			</ShareWithSongs>
			{editSongID ? <SongModal songID={editSongID} shareID={shareID} closeForm={() => setEditSongID(null)} /> : null}
		</>
	);
}