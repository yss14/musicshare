import React, { useContext } from "react";
import { Route, useParams, useRouteMatch, Redirect } from "react-router";
import { ShareSongs } from "./ShareSongs";
import { PlaylistSongs } from "./PlaylistSongs";
import { IShareRoute } from "../../interfaces";
import { __RouterContext } from 'react-router'
import { useUpdateShareID } from "../../graphql/client/mutations/shareid-mutation";

export const Share = () => {
	console.log('Share')
	const { shareID } = useParams<IShareRoute>()
	const match = useRouteMatch()
	useUpdateShareID(shareID)
	console.log(match)
	if (!match) return <Redirect to="/" />

	return (
		<>
			<Route
				path={`${match.url}/playlists/:playlistID`}
				render={() => <PlaylistSongs shareID={shareID} />}
			/>
			<Route path="/shares/:shareID" exact render={() => <ShareSongs />} />
		</>
	);
};
