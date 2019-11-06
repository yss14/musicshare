import React, { useEffect } from "react";
import { Route, useParams, useRouteMatch, Redirect } from "react-router";
import { ShareSongs } from "./ShareSongs";
import { PlaylistSongs } from "./PlaylistSongs";
import { IShareRoute, ISharePlaylistRoute } from "../../interfaces";
import { useUpdateShareID } from "../../graphql/client/mutations/shareid-mutation";
import { useUpdateplaylistID } from "../../graphql/client/mutations/playlistid-mutation";

const UpdatePlaylistID: React.FC = ({ children }) => {
	const { playlistID } = useParams<ISharePlaylistRoute>()
	const updatePlaylistID = useUpdateplaylistID()

	useEffect(() => {
		updatePlaylistID(playlistID)
	}, [playlistID, updatePlaylistID])

	useEffect(() => () => {
		updatePlaylistID(null)
	}, [updatePlaylistID]);

	return <>{children}</>
}

export const Share = () => {
	const { shareID } = useParams<IShareRoute>()
	const match = useRouteMatch()
	useUpdateShareID(shareID)

	if (!match) return <Redirect to="/" />

	return (
		<>
			<Route
				path={`${match.url}/playlists/:playlistID`}
				render={() => <UpdatePlaylistID><PlaylistSongs shareID={shareID} /></UpdatePlaylistID>}
			/>
			<Route path="/shares/:shareID" exact render={() => <ShareSongs />} />
		</>
	);
};
