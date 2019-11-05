import { useApolloClient } from "react-apollo";
import { useMemo } from "react";
import { getSongMediaURL } from "../graphql/programmatic/get-song-mediaurl";
import { IScopedSong } from "../graphql/types";

export const useSongUtils = () => {
	const apolloClient = useApolloClient();
	const fetchSongMediaURL = useMemo(() => getSongMediaURL(apolloClient), [apolloClient]);

	const makePlayableSong = (song: IScopedSong) => ({
		...song,
		getMediaURL: () => fetchSongMediaURL(song.shareID, song.id)
	});

	return { makePlayableSong }
}
