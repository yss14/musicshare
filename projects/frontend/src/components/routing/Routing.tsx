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

const Share = lazy(() => import("../../pages/share/Share"));

export const Routing = () => {
	const { data, error, loading } = useUser();
	const history = useHistory()

	useEffect(() => {
		if (error) {
			console.error(error)

			history.push('/login')
		}
	}, [error]);

	if (loading || !data) {
		return <Spin />;
	}

	return (
		<Suspense fallback={<Spin />}>
			<Switch>
				<Route
					path="/shares/:shareID"
					render={() => (
						<MainLayout
							content={<UploadDropzone><Share /></UploadDropzone>}
							sidebarLeft={<SharePlaylistsSidebar />}
						/>
					)} />
				<Route exact path="/login" render={() => <Login />} />
				<Route exact path="/" render={() => <RedirectToLibrary shares={data.user.shares} />} />
				<Route render={() => <NotFound />} />
			</Switch>
		</Suspense>
	);
};
