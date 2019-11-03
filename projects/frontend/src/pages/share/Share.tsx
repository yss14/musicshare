import React from "react";
import { Route, useParams, useRouteMatch, Redirect } from "react-router";
import { ShareSongs } from "./ShareSongs";
import { PlaylistSongs } from "./PlaylistSongs";
import { ShareIDContext } from "../../context/ShareIDContext";
import { IShareRoute } from "../../interfaces";

export const Share = () => {
	const { shareID } = useParams<IShareRoute>()
	const match = useRouteMatch()

	if (!match) return <Redirect to="/" />

	return (
		<ShareIDContext.Provider value={shareID}>
			<Route
				path={`${match.url}/playlists/:playlistID`}
				render={() => <PlaylistSongs shareID={shareID} />}
			/>
			<Route path="/shares/:shareID" exact render={() => <ShareSongs />} />
		</ShareIDContext.Provider>
	);
};
