import React from 'react'
import { useMergedSongs } from '../../graphql/queries/merged-songs-query'
import { SongsView } from './SongsView';
import { Spinner } from '../../components/Spinner';

export const MergedSongs: React.FC = () => {
	const { loading, error, data: songs } = useMergedSongs()

	if (loading || !songs) {
		return <Spinner />;
	}
	if (error) return <div>`Error!: ${error}`</div>;

	return <SongsView title="All songs" songs={songs} />
}