import React from 'react';
import { useSong } from '../../../graphql/queries/song-query';
import { useGenres } from '../../../graphql/queries/genre-query';
import { useSongTypes } from '../../../graphql/queries/song-types';
import { useArtists } from '../../../graphql/queries/artists-query';
import { SongForm } from './SongForm';
import { useTags } from '../../../graphql/queries/tags-query';
import { IScopedSong } from '../../../graphql/types';

interface ISongModalProps {
	song: IScopedSong;
	playlistID?: string;
	closeForm: () => void;
}

export const SongModal = ({ song, closeForm, playlistID }: ISongModalProps) => {
	const { loading: loadingSong, error: errorSong, data: songFromAPI } = useSong(song.shareID, song.id)
	const { loading: loadingGenres, error: errorGenres, data: dataGenres } = useGenres(song.shareID)
	const { loading: loadingArtists, error: errorArtists, data: dataArtists } = useArtists(song.shareID)
	const { loading: loadingTags, error: errorTags, data: dataTags } = useTags(song.shareID)
	const { loading: loadingSongTypes, error: errorSongTypes, data: dataSongTypes } = useSongTypes(song.shareID)

	if (loadingSong || loadingGenres || loadingSongTypes || loadingArtists || loadingTags) {
		return <div>Loading</div>;
	}
	if (errorSong || errorGenres || errorSongTypes || errorArtists || errorTags) {
		closeForm();

		return null;
	}
	if (songFromAPI && dataGenres && dataSongTypes && dataArtists && dataTags) {
		return (
			<SongForm
				song={songFromAPI}
				genres={dataGenres.share.genres}
				songTypes={dataSongTypes.share.songTypes}
				artists={dataArtists.share.artists}
				closeForm={closeForm}
				tags={dataTags.share.tags}
				playlistID={playlistID}
				readOnly={song.libraryID !== song.shareID} // TODO improve
			/>
		)
	} else {
		console.error('Some data is invalid', { songFromAPI, dataGenres, dataSongTypes });

		closeForm();

		return null;
	}
}
