import gql from "graphql-tag";
import { Nullable } from "../../types/Nullable";
import { shareSongKeys, IBaseSong } from "../types";
import { MutationUpdaterFn } from "apollo-client/core/watchQueryOptions";
import { IGetPlaylistSongsData, IGetPlaylistSongsVariables, PLAYLIST_WITH_SONGS } from "../queries/playlist-songs";

export const UPDATE_SONG = gql`
	mutation UpdateSong($shareID: String!, $songID: String!, $song: SongUpdateInput!){
		updateSong(shareID: $shareID, songID: $songID, song: $song){
			${shareSongKeys}
		}
	}
`;

export interface ISongUpdateInput {
	title?: string;
	suffix?: string;
	year?: number;
	bpm?: number;
	releaseDate?: string;
	isRip?: boolean;
	artists?: string[];
	remixer?: string[];
	featurings?: string[];
	type?: string;
	genres?: string[];
	label?: string;
	tags?: string[];
}

export interface IUpdateSongVariables {
	shareID: string;
	songID: string;
	song: Nullable<ISongUpdateInput>;
}

export interface IUpdateSongData {
	updateSong: IBaseSong;
}

//export class UpdateSongMutation extends Mutation<IUpdateSongData, IUpdateSongVariables>{ }

export const makeUpdateSongCache = (shareID: string, playlistID?: string): MutationUpdaterFn<IUpdateSongData> => (cache, { data }) => {
	if (!playlistID) return;

	const currentPlaylist = cache.readQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
		query: PLAYLIST_WITH_SONGS,
		variables: { playlistID, shareID }
	});

	const newSongList = currentPlaylist!.share.playlist.songs.map(song =>
		song.id === data!.updateSong.id
			? { ...song, ...data!.updateSong }
			: song
	);

	cache.writeQuery<IGetPlaylistSongsData, IGetPlaylistSongsVariables>({
		query: PLAYLIST_WITH_SONGS,
		data: { share: { id: shareID, __typename: 'Share', playlist: { ...currentPlaylist!.share.playlist, songs: newSongList } } },
		variables: { playlistID, shareID }
	});
}
