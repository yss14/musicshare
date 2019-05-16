import React from 'react';
import { SongQuery, GET_SONG } from '../../../resolvers/queries/song-query';
import { GenresQuery, GET_GENRES } from '../../../resolvers/queries/genre-query';
import { SongTypesQuery, GET_SONGTYPES } from '../../../resolvers/queries/song-types';
import { ArtistsQuery, GET_ARTISTS } from '../../../resolvers/queries/artists-query';
import { SongForm } from './SongForm';

interface ISongModalProps {
	shareID: string;
	songID: string;
	onSongUpdate?: (updatedSong: any) => void;
	closeForm: () => void;
}

export const SongModal = ({ songID, shareID, closeForm }: ISongModalProps) => {
	return (
		<SongQuery query={GET_SONG} variables={{ songID, shareID }}>
			{({ loading: loadingSong, error: errorSong, data: dataSong }) => (
				<GenresQuery query={GET_GENRES} variables={{ shareID }}>
					{({ loading: loadingGenres, error: errorGenres, data: dataGenres }) => (
						<ArtistsQuery query={GET_ARTISTS} variables={{ shareID }}>
							{({ loading: loadingArtists, error: errorArtists, data: dataArtists }) => (
								<SongTypesQuery query={GET_SONGTYPES} variables={{ shareID }}>
									{({ loading: loadingSongTypes, error: errorSongTypes, data: dataSongTypes }) => {

										if (loadingSong || loadingGenres || loadingSongTypes || loadingArtists) {
											return <div>Loading</div>;
										}
										if (errorSong || errorGenres || errorSongTypes || errorArtists) {
											closeForm();

											return null;
										}
										if (dataSong && dataGenres && dataSongTypes && dataArtists) {
											return (
												<SongForm
													song={dataSong.share.song}
													genres={dataGenres.share.genres}
													songTypes={dataSongTypes.share.songTypes}
													artists={dataArtists.share.artists}
													closeForm={closeForm}
													shareID={shareID}
												/>
											)
										} else {
											console.error('Some data is invalid', { dataSong, dataGenres, dataSongTypes });

											closeForm();

											return null;
										}
									}}
								</SongTypesQuery>
							)}
						</ArtistsQuery>
					)}
				</GenresQuery>
			)}
		</SongQuery>
	);
}
