import React, { Suspense, lazy } from "react";
import { Route } from "react-router-dom";

const Shares = lazy(() => import("./pages/shares/Shares"));
const Share = lazy(() => import("./pages/share/Share"));
export default () => {
  return (
    <Suspense fallback="Loading...">
      <Route path="/shares/:id" component={Share} />
      <Route exact path="/" component={Shares} />
    </Suspense>
  );
};
