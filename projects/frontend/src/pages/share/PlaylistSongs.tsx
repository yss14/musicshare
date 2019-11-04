import React from "react";
import { ISharePlaylistRoute } from "../../interfaces";
import { usePlaylist } from "../../graphql/queries/playlist-songs";
import { Spinner } from "../../components/Spinner";
import { useParams } from "react-router-dom";
import { SongsView } from "./SongsView";

export interface IPlaylistSongsProps {
	shareID: string;
}

export const PlaylistSongs = ({ shareID }: IPlaylistSongsProps) => {
	const { playlistID } = useParams<ISharePlaylistRoute>();

	const { loading, data: playlist, error } = usePlaylist({ playlistID, shareID });

	if (loading) return <Spinner />;
	if (error) return <div>{error.message}</div>;
	if (!playlist) return <div>No data</div>

	const { songs, id } = playlist;

	return <SongsView title={playlist.name} songs={songs} playlistID={id} />
};
