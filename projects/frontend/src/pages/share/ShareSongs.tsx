import React from 'react';
import { useShareSongs } from '../../graphql/queries/share-songs-query';
import { IShareRoute } from '../../interfaces';
import { useParams } from 'react-router-dom';
import { SongsView } from './SongsView';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ShareSongs: React.FC = () => {
	const { shareID } = useParams<IShareRoute>();
	const { loading, error, data: songs } = useShareSongs(shareID);

	if (loading || !songs) {
		return <LoadingSpinner />;
	}
	if (error) return <div>`Error!: ${error}`</div>;

	return <SongsView title="All songs" songs={songs} />
}
