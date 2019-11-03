import React, { Suspense, lazy, useEffect } from "react";
import { Route, useHistory, Switch, useRouteMatch } from "react-router-dom";
import { Spin } from "antd";
import Login from "../../pages/login/Login";
import { useUser } from "../../graphql/queries/user-query";
import { MainLayout } from "../MainLayout";
import { RedirectToLibrary } from "./RedirectToLibrary";
import { NotFound } from "./NotFound";
import { PlaylistSidebar } from "../sidebar/PlaylistsSidebar";
import { UploadDropzone } from "../upload/UploadDropzone";
import { useAuthToken } from "../../graphql/client/queries/auth-token-query";

const Share = lazy(() => import("../../pages/share/Share").then(module => ({ default: module.Share })));

export const Routing = () => {
	const authToken = useAuthToken()
	const history = useHistory()

	useEffect(() => {
		if (!authToken) {
			history.push('/login')
		}
	}, [authToken, history])

	return (
		<Suspense fallback={<Spin />}>
			<Switch>
				{authToken && <LoggedInRoutes />}
				<Route exact path="/login" render={() => <Login />} />
				<Route render={() => <NotFound />} />
			</Switch>
		</Suspense>
	);
};

const ShareRoute = () => {
	const match = useRouteMatch()!

	return (
		<MainLayout
			content={<UploadDropzone><Share /></UploadDropzone>}
			sidebarLeft={<PlaylistSidebar merged={match.url.startsWith("/all/")} />}
		/>
	)
}

const LoggedInRoutes = () => {
	const { data, error, loading } = useUser();
	const history = useHistory()

	useEffect(() => {
		if (error) {
			console.error(error)

			history.push('/login')
		}
	}, [error, history]);

	if (loading) {
		return <Spin />;
	}

	return (
		<>
			<Route
				path="/all"
				exact
				render={() => (
					<MainLayout
						content={<div>All Songs...</div>}
						sidebarLeft={<PlaylistSidebar merged={true} />}
					/>
				)}
			/>
			<Route
				path={["/shares/:shareID", "/all/shares/:shareID"]}
				render={() => <ShareRoute />} />
			{data && <Route exact path="/" render={() => <RedirectToLibrary shares={data.user.shares} />} />}
		</>
	)
}
