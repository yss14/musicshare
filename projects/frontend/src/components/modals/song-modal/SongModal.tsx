import React from 'react';
import { useSong } from '../../../graphql/queries/song-query';
import { useGenres } from '../../../graphql/queries/genre-query';
import { useSongTypes } from '../../../graphql/queries/song-types';
import { useArtists } from '../../../graphql/queries/artists-query';
import { SongForm } from './SongForm';
import { useTags } from '../../../graphql/queries/tags-query';

interface ISongModalProps {
	shareID: string;
	songID: string;
	playlistID?: string;
	closeForm: () => void;
}

export const SongModal = ({ songID, shareID, closeForm, playlistID }: ISongModalProps) => {
	const { loading: loadingSong, error: errorSong, data: dataSong } = useSong(shareID, songID)
	const { loading: loadingGenres, error: errorGenres, data: dataGenres } = useGenres(shareID)
	const { loading: loadingArtists, error: errorArtists, data: dataArtists } = useArtists(shareID)
	const { loading: loadingTags, error: errorTags, data: dataTags } = useTags(shareID)
	const { loading: loadingSongTypes, error: errorSongTypes, data: dataSongTypes } = useSongTypes(shareID)

	if (loadingSong || loadingGenres || loadingSongTypes || loadingArtists || loadingTags) {
		return <div>Loading</div>;
	}
	if (errorSong || errorGenres || errorSongTypes || errorArtists || errorTags) {
		closeForm();

		return null;
	}
	if (dataSong && dataGenres && dataSongTypes && dataArtists && dataTags) {
		return (
			<SongForm
				song={dataSong.share.song}
				genres={dataGenres.share.genres}
				songTypes={dataSongTypes.share.songTypes}
				artists={dataArtists.share.artists}
				closeForm={closeForm}
				shareID={shareID}
				tags={dataTags.share.tags}
				playlistID={playlistID}
			/>
		)
	} else {
		console.error('Some data is invalid', { dataSong, dataGenres, dataSongTypes });

		closeForm();

		return null;
	}
}
