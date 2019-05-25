import React, { Suspense, lazy, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import { Spin } from "antd";
import RouteWrapper from "./components/RouteWrapper";
import Login from "./pages/login/Login";
import { useAuthToken } from "./graphql/client/queries/auth-token-query";
import { useUser } from "./graphql/queries/user-query";

const Share = lazy(() => import("./pages/share/Share"));

export default () => {
  const { data, error, loading } = useUser();
  if (loading) {
    return <Spin />;
  }
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
      <Route exact path="/login" render={() => <Login />} />
      <Route
        exact
        path="/"
        render={() =>
          data && data.user && data.user.id && !error ? (
            <Redirect to="/library" />
          ) : (
            <Redirect to="/login" />
          )
        }
      />
    </Suspense>
  );
};
