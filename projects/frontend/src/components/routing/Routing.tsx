import React, { Suspense, lazy, useEffect } from "react"
import { Route, useHistory, Switch, useRouteMatch } from "react-router-dom"
import { Login } from "../../pages/login/Login"
import { MainLayout } from "../MainLayout"
import { RedirectToLibrary } from "./RedirectToLibrary"
import { NotFound } from "../../pages/status/NotFound"
import { PlaylistSidebar } from "../sidebar/PlaylistsSidebar"
import { UploadDropzone } from "../upload/UploadDropzone"
import { MergedSongs } from "../../pages/share/MergedSongs"
import { Offline } from "../../pages/status/Offline"
import { LoadingSpinner } from "../common/LoadingSpinner"
import { AcceptInvitation } from "../../pages/accept-invitation/AcceptInvitation"
import { RestorePassword } from "../../pages/restore-password/RestorePassword"
import { PlayerProvider } from "../../player/PlayerContext"
import { SongUploadProvider } from "../../utils/upload/SongUploadContext"
import { useViewer, useAuth } from "@musicshare/react-graphql-client"
import { useLibraryID } from "../../hooks/data/useLibraryID"
import { useUpdateLibraryID } from "../../hooks/data/useUpdateLibraryID"
import { Registration } from "../../pages/registration/Registration"
import { useConfig } from "../../hooks/use-config"

const Share = lazy(() => import("../../pages/share/Share").then((module) => ({ default: module.Share })))

export const Routing = () => {
	const config = useConfig()

	return (
		<Suspense fallback={<LoadingSpinner />}>
			<Switch>
				<Route path="/login/:email?" render={() => <Login />} />
				{config.settings.publicRegistration === true && (
					<Route path="/registration" render={() => <Registration />} />
				)}
				<Route path="/invitation/:invitationToken" render={() => <AcceptInvitation />} />
				<Route path="/password/restore" render={() => <RestorePassword />} />
				<Route exact path="/404" render={() => <NotFound />} />
				<Route path="/offline" render={() => <Offline />} />
				<LoggedInRoutes />
				<Route render={() => <NotFound />} />
			</Switch>
		</Suspense>
	)
}

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
	const { data: viewer, error, isLoading } = useViewer()
	const updateLibraryID = useUpdateLibraryID()
	const libraryID = useLibraryID()
	const history = useHistory()
	const { data: auth, isLoading: isLoadingAuth } = useAuth()

	useEffect(() => {
		if (auth && !auth.isLoggedIn) {
			history.push("/login")
		}
	}, [auth, history])

	useEffect(() => {
		if (error) {
			console.error(error)

			history.push("/login")
		}
	}, [error, history])

	useEffect(() => {
		const library = viewer?.shares.find((share) => share.isLibrary === true)

		if (library?.id) {
			updateLibraryID(library!.id)
		}
	}, [viewer, updateLibraryID, libraryID])

	if (isLoading || isLoadingAuth) {
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
				{viewer && <Route exact path="/" render={() => <RedirectToLibrary shares={viewer.shares} />} />}
			</SongUploadProvider>
		</PlayerProvider>
	)
}
