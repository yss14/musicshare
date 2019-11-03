import { IPlaylistSong, playlistSongKeys } from "../types";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useCallback } from "react";
import { MutationUpdaterFn } from "apollo-client";
import { IGetPlaylistSongsData, IGetPlaylistSongsVariables, PLAYLIST_WITH_SONGS } from "../queries/playlist-songs";
import { IGetPlaylistsData, IGetPlaylistsVariables, GET_SHARE_PLAYLISTS } from "../queries/playlists-query";

export interface IAddSongsToPlaylistVariables {
	shareID: string;
	playlistID: string;
	songIDs: string[];
}

export interface IAddSongsToPlaylistData {
	addSongsToPlaylist: IPlaylistSong[];
}

export const ADD_SONGS_TO_PLAYLIST = gql`
	mutation AddSongsToPlaylist($shareID: String!, $playlistID: String!, $songIDs: [String!]!){
		addSongsToPlaylist(shareID: $shareID, playlistID: $playlistID, songIDs: $songIDs){
			${playlistSongKeys}
		}
	}
`;

export const useAddSongsToPlaylist = () => {
	const [invokeMutation] = useMutation<IAddSongsToPlaylistData, IAddSongsToPlaylistVariables>(ADD_SONGS_TO_PLAYLIST)

	const updatePlaylistSongsCache = useCallback((shareID: string, playlistID: string): MutationUpdaterFn<IAddSongsToPlaylistData> => (cache, { data }) => {
		const currentPlaylist = cache.readQuery<IGetPlaylistsData, IGetPlaylistsVariables>({
			query: GET_SHARE_PLAYLISTS,
			variables: { shareID }
		})!.share.playlists.find(playlist => playlist.id === playlistID)

		console.log(currentPlaylist)

		if (!currentPlaylist) {
			console.error(`Cannot update playlist ${playlistID} due to missing cache entry`)

			return
		}

		cache.writeQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
			query: PLAYLIST_WITH_SONGS,
			data: {
				share: {
					id: shareID,
					__typename: 'Share',
					playlist: {
						...currentPlaylist,
						songs: data!.addSongsToPlaylist,
						__typename: 'Playlist'
					}
				}
			}
		})
	}, []);

	return (shareID: string, playlistID: string, songIDs: string[]) => invokeMutation({
		variables: {
			shareID,
			playlistID,
			songIDs,
		},
		update: updatePlaylistSongsCache(shareID, playlistID),
	})
}
