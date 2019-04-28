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
        path="/shares/:id"
        render={() => (
          <RouteWrapper>
            {container => <Share container={container} />}
          </RouteWrapper>
        )}
      />
      <Route
        path="/library"
        render={() => (
          <RouteWrapper>{container => <div>Library</div>}</RouteWrapper>
        )}
      />

      <Route path="/shares/:id/songs" component={() => <div>Songs</div>} />
      <Route path="/shares/:id/artists" component={() => <div>Artists</div>} />
      <Route path="/shares/:id/albums" component={() => <div>Albums</div>} />
      <Route path="/shares/:id/genres" component={() => <div>Genres</div>} />
      <Route exact path="/" component={Shares} />
    </Suspense>
  );
};
