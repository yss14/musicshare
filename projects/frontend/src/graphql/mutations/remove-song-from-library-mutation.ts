import gql from "graphql-tag";
import { useMutation, MutationResult } from "react-apollo";
import { useCallback } from "react";
import { MutationUpdaterFn } from "apollo-client";
import { IGetShareWithSongsData, IGetShareWithSongsVariables, GET_SHARE_WITH_SONGS } from "../queries/share-songs-query";
import { IGetPlaylistSongsData, PLAYLIST_WITH_SONGS, IGetPlaylistSongsVariables } from "../queries/playlist-songs";

interface IRemoveSongFromLibraryData {
	removeSongFromLibrary: {
		shareID: string;
		playlistID: string;
		oldSongID: string;
		newSongID: string;
		newLibraryID: string;
	}[];
}

interface IRemoveSongFromLibraryVariables {
	input: {
		shareID: string;
		songID: string;
	}
}

const REMOVE_SONG_FROM_LIBRARY = gql`
	mutation RemoveSongFromLibrary($input: RemoveSongFromLibraryInput!) {
		removeSongFromLibrary(input: $input) {
			shareID
			playlistID
			oldSongID
			newSongID
			newLibraryID
		}
	}
`

export const useRemoveSongFromLibrary = () => {
	const [removeSongFromLibraryMutation, other] = useMutation<IRemoveSongFromLibraryData, IRemoveSongFromLibraryVariables>(REMOVE_SONG_FROM_LIBRARY)

	const makeUpdateCache = useCallback((shareID: string, songID: string): MutationUpdaterFn<IRemoveSongFromLibraryData> => (cache, { data }) => {
		if (!data) return

		const shareData = cache.readQuery<IGetShareWithSongsData, IGetShareWithSongsVariables>({
			query: GET_SHARE_WITH_SONGS,
			variables: {
				shareID,
			},
		})!

		const oldSong = shareData.share.songs.find(song => song.id === songID)

		if (!oldSong) {
			console.error(`Cannot update cache because old song with id ${songID} is not present in cache`)

			return
		}

		// removes song from library as well as from the library's playlists
		cache.writeQuery<IGetShareWithSongsData, IGetShareWithSongsVariables>({
			query: GET_SHARE_WITH_SONGS,
			variables: {
				shareID,
			},
			data: {
				share: {
					...shareData.share,
					songs: shareData.share.songs.filter(song => song.id !== songID)
				}
			}
		})

		// move song to share playlists with used to reference the library song
		for (const songIDUpdate of data.removeSongFromLibrary) {
			try {
				const playlist = cache.readQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
					query: PLAYLIST_WITH_SONGS,
					variables: {
						shareID: songIDUpdate.shareID,
						playlistID: songIDUpdate.playlistID,
					},

				})

				if (!playlist) {
					console.error(`Cannot update song reference of playlist ${songIDUpdate.playlistID} because playlist is not present in cache`)

					return
				}

				cache.writeQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
					query: PLAYLIST_WITH_SONGS,
					variables: {
						shareID: songIDUpdate.shareID,
						playlistID: songIDUpdate.playlistID,
					},
					data: {
						share: {
							id: playlist.share.id,
							__typename: 'Share',
							playlist: {
								...playlist.share.playlist,
								id: playlist.share.playlist.id,
								__typename: 'Playlist',
								songs: playlist.share.playlist.songs.map(song => song.id === songIDUpdate.oldSongID
									? {
										...song,
										id: songIDUpdate.newSongID,
										libraryID: songIDUpdate.newLibraryID,
									}
									: song
								),
							}
						}
					}
				})
			} catch (err) {
				if (err && err.message && err.message.indexOf(`Can't find field share({"shareID":"${songIDUpdate.shareID}"}) on object`) > -1) {
					console.info(`Cannot update song reference of playlist ${songIDUpdate.playlistID} because share is not present in cache. This is intended behaviour.`)
				} else {
					console.error(err)
				}
			}
		}
	}, [])

	const removeSongFromLibrary = useCallback((libraryID: string, songID: string) => {
		removeSongFromLibraryMutation({
			variables: {
				input: {
					shareID: libraryID,
					songID,
				}
			},
			update: makeUpdateCache(libraryID, songID),
		})
	}, [removeSongFromLibraryMutation, makeUpdateCache])

	return [removeSongFromLibrary, other] as [(libraryID: string, songID: string) => void, MutationResult<IRemoveSongFromLibraryData>]
}