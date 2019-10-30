import { useApolloClient } from "react-apollo";
import { useMemo } from "react";
import { getSongMediaURL } from "../graphql/programmatic/get-song-mediaurl";
import { IBaseSong } from "../graphql/types";

export const useSongUtils = () => {
	const apolloClient = useApolloClient();
	const fetchSongMediaURL = useMemo(() => getSongMediaURL(apolloClient), [apolloClient]);

	const makePlayableSong = (shareID: string) => (song: IBaseSong) => ({
		...song,
		getMediaURL: () => fetchSongMediaURL(shareID, song.id)
	});

	return { makePlayableSong }
}
