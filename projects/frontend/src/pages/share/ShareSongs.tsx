import React, { useState } from 'react';
import { ShareWithSongs, GET_SHARE_WITH_SONGS } from '../../graphql/queries/share-songs-query';
import { SongTable } from '../../components/song-table/SongTable';
import { SongModal } from '../../components/modals/song-modal/SongModal';
import useReactRouter from 'use-react-router';
import { IShareRoute } from '../../interfaces';
import { SongTableHeader } from '../../components/song-table/SongTableHeader';
import { Spinner } from '../../components/Spinner';

export const ShareSongs = () => {
	const [editSongID, setEditSongID] = useState<string | null>(null);
	const { match: { params: { shareID } } } = useReactRouter<IShareRoute>();

	const onRowClick = (song: any) => {
		setEditSongID(song.id);
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