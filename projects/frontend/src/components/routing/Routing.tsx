import React, { Suspense, lazy, useEffect } from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import { Spin } from "antd";
import Login from "../../pages/login/Login";
import { useUser } from "../../graphql/queries/user-query";
import { MainLayout } from "../MainLayout";
import { RedirectToLibrary } from "./RedirectToLibrary";
import { NotFound } from "./NotFound";
import { SharePlaylistsSidebar } from "../menu/SharePlaylistsSidebar";
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
	}, [authToken])

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
	console.log(Share)
	return (
		<>
			<Route
				path="/shares/:shareID"
				render={() => (
					<MainLayout
						content={<UploadDropzone><Share /></UploadDropzone>}
						sidebarLeft={<SharePlaylistsSidebar />}
					/>
				)} />
			{data && <Route exact path="/" render={() => <RedirectToLibrary shares={data.user.shares} />} />}
		</>
	)
}
