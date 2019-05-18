import React, { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { Spin } from "antd";
import RouteWrapper from "./components/RouteWrapper";

const Shares = lazy(() => import("./pages/shares/Shares"));
const Share = lazy(() => import("./pages/share/Share"));

export default () => {
	return (
		<Suspense fallback={<Spin />}>
			<Route
				path="/shares/:shareID"
				render={() => <RouteWrapper>{container => <Share />}</RouteWrapper>}
			/>
			<Route
				path="/library"
				render={() => (
					<RouteWrapper>{container => <div>Library</div>}</RouteWrapper>
				)}
			/>
			<Route exact path="/" component={Shares} />
		</Suspense>
	);
};
