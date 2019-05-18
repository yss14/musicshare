import React from 'react';
import { SongQuery, GET_SONG } from '../../../graphql/queries/song-query';
import { GenresQuery, GET_GENRES } from '../../../graphql/queries/genre-query';
import { SongTypesQuery, GET_SONGTYPES } from '../../../graphql/queries/song-types';
import { ArtistsQuery, GET_ARTISTS } from '../../../graphql/queries/artists-query';
import { SongForm } from './SongForm';
import { TagsQuery, GET_TAGS } from '../../../graphql/queries/tags-query';

interface ISongModalProps {
	shareID: string;
	songID: string;
	playlistID?: string;
	closeForm: () => void;
}

export const SongModal = ({ songID, shareID, closeForm, playlistID }: ISongModalProps) => {
	return (
		<SongQuery query={GET_SONG} variables={{ songID, shareID }} fetchPolicy="network-only">
			{({ loading: loadingSong, error: errorSong, data: dataSong }) => (
				<GenresQuery query={GET_GENRES} variables={{ shareID }}>
					{({ loading: loadingGenres, error: errorGenres, data: dataGenres }) => (
						<ArtistsQuery query={GET_ARTISTS} variables={{ shareID }} fetchPolicy="network-only">
							{({ loading: loadingArtists, error: errorArtists, data: dataArtists }) => (
								<TagsQuery query={GET_TAGS} variables={{ shareID }} fetchPolicy="network-only">
									{({ loading: loadingTags, error: errorTags, data: dataTags }) => (
										<SongTypesQuery query={GET_SONGTYPES} variables={{ shareID }}>
											{({ loading: loadingSongTypes, error: errorSongTypes, data: dataSongTypes }) => {

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
											}}
										</SongTypesQuery>
									)}
								</TagsQuery>
							)}
						</ArtistsQuery>
					)}
				</GenresQuery>
			)}
		</SongQuery>
	);
}
