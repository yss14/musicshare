import React, { useEffect } from "react"
import { Route, useParams, useRouteMatch, Redirect } from "react-router"
import { ShareSongs } from "./ShareSongs"
import { PlaylistSongs } from "./PlaylistSongs"
import { IShareRoute, ISharePlaylistRoute } from "../../interfaces"
import { useUpdatePlaylistID } from "../../hooks/data/useUpdatePlaylistID"
import { useUpdateShareID } from "../../hooks/data/useUpdateShareID"

const UpdatePlaylistID: React.FC = ({ children }) => {
	const { playlistID } = useParams<ISharePlaylistRoute>()
	const updatePlaylistID = useUpdatePlaylistID()

	useEffect(() => {
		updatePlaylistID(playlistID)
	}, [playlistID, updatePlaylistID])

	useEffect(
		() => () => {
			updatePlaylistID(null)
		},
		[updatePlaylistID],
	)

	return <>{children}</>
}

export const Share = React.memo(() => {
	const { shareID } = useParams<IShareRoute>()
	const match = useRouteMatch()
	const updateShareID = useUpdateShareID()

	useEffect(() => {
		updateShareID(shareID)
	}, [shareID, updateShareID])

	if (!match) return <Redirect to="/" />

	return (
		<>
			<Route
				path={`${match.url}/playlists/:playlistID`}
				render={() => (
					<UpdatePlaylistID>
						<PlaylistSongs shareID={shareID} />
					</UpdatePlaylistID>
				)}
			/>
			<Route path="/shares/:shareID" exact render={() => <ShareSongs />} />
		</>
	)
})
