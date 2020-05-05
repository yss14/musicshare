import React, { Suspense, lazy, useEffect } from "react"
import { Route, useHistory, Switch, useRouteMatch } from "react-router-dom"
import { Login } from "../../pages/login/Login"
import { useUser } from "../../graphql/queries/user-query"
import { MainLayout } from "../MainLayout"
import { RedirectToLibrary } from "./RedirectToLibrary"
import { NotFound } from "../../pages/status/NotFound"
import { PlaylistSidebar } from "../sidebar/PlaylistsSidebar"
import { UploadDropzone } from "../upload/UploadDropzone"
import { useAuthToken } from "../../graphql/client/queries/auth-token-query"
import { MergedSongs } from "../../pages/share/MergedSongs"
import { useUpdateLibraryID } from "../../graphql/client/mutations/libraryid-mutation"
import { useLibraryID } from "../../graphql/client/queries/libraryid-query"
import { Offline } from "../../pages/status/Offline"
import { LoadingSpinner } from "../common/LoadingSpinner"
import { AcceptInvitation } from "../../pages/accept-invitation/AcceptInvitation"
import { RestorePassword } from "../../pages/restore-password/RestorePassword"
import { PlayerProvider } from "../../player/PlayerContext"
import { SongUploadProvider } from "../../utils/upload/SongUploadContext"

const Share = lazy(() => import("../../pages/share/Share").then((module) => ({ default: module.Share })))

export const Routing = () => (
	<Suspense fallback={<LoadingSpinner />}>
		<Switch>
			<Route path="/login/:email?" render={() => <Login />} />
			<Route path="/invitation/:invitationToken" render={() => <AcceptInvitation />} />
			<Route path="/password/restore" render={() => <RestorePassword />} />
			<Route exact path="/404" render={() => <NotFound />} />
			<Route path="/offline" render={() => <Offline />} />
			<LoggedInRoutes />
			<Route render={() => <NotFound />} />
		</Switch>
	</Suspense>
)

const ShareRoute = () => {
	const match = useRouteMatch()!

	return (
		<MainLayout
			content={
				<UploadDropzone>
					<Share />
				</UploadDropzone>
			}
			sidebarLeft={<PlaylistSidebar merged={match.url.startsWith("/all/")} />}
		/>
	)
}

const LoggedInRoutes = () => {
	const { data, error, loading } = useUser()
	const updateLibraryID = useUpdateLibraryID()
	const libraryID = useLibraryID()
	const history = useHistory()
	const authToken = useAuthToken()

	useEffect(() => {
		if (!authToken) {
			history.push("/login")
		}
	}, [authToken, history])

	useEffect(() => {
		if (error) {
			console.error(error)

			history.push("/login")
		}
	}, [error, history])

	useEffect(() => {
		if (data && !libraryID) {
			const library = data.viewer.shares.find((share) => share.isLibrary === true)

			updateLibraryID(library ? library.id : null)
		}
	}, [data, updateLibraryID, libraryID])

	if (loading) {
		return <LoadingSpinner />
	}

	return (
		<PlayerProvider>
			<SongUploadProvider>
				<Route
					path="/all"
					exact
					render={() => (
						<MainLayout
							content={
								<UploadDropzone>
									<MergedSongs />
								</UploadDropzone>
							}
							sidebarLeft={<PlaylistSidebar merged={true} />}
						/>
					)}
				/>
				<Route path={["/shares/:shareID", "/all/shares/:shareID"]} render={() => <ShareRoute />} />
				{data && <Route exact path="/" render={() => <RedirectToLibrary shares={data.viewer.shares} />} />}
			</SongUploadProvider>
		</PlayerProvider>
	)
}
