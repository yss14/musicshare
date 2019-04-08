import * as React from "react";
import { createReduxStore } from "./redux/create-store";
import { Provider } from "react-redux";
import { Router, Route, Switch } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { createBrowserHistory } from "history";
import { NotFoundView } from "./components/views/not-found/NotFound";
import { DebugShareSelection } from "./components/views/debug-share-selection/DebugShareSelection";
import { makeAPIContext, makeAPIContextValue } from "./context/APIContext";
import { makeConfigFromEnv } from "./types/other/config";
import { makeAPIs } from "./apis/make-apis";
import { StoreContext } from "./redux/custom-store-hooks";
import { ShareView } from "./components/views/main/ShareView";
import { persistUser } from "./redux/persist-user";
import "./antd.css";

const GlobalStyle = createGlobalStyle`

	html, body, #root {
		margin: 0px;
		padding: 0px;
		width: 100%;
		height: 100%;
	}

	* { 
		box-sizing: border-box;
		font-family: 'Open Sans';
	}
`;

const history = createBrowserHistory();
const store = createReduxStore(history);

persistUser(store);

const config = makeConfigFromEnv();
const apis = makeAPIs(config);
const APIContext = makeAPIContext(apis);

export const Root = () => (
  <Provider store={store}>
    <StoreContext.Provider value={store}>
      <APIContext.Provider value={makeAPIContextValue(apis)}>
        <GlobalStyle />
        <Router history={history}>
          <Route path="/" component={App} />
        </Router>
      </APIContext.Provider>
    </StoreContext.Provider>
  </Provider>
);

const Login: React.StatelessComponent = () => <h1>Login</h1>;

const App = () => (
  <Switch>
    <Route path="/" exact component={DebugShareSelection} />
    <Route path="/login" component={Login} />
    <Route path="/shares/" component={ShareView} />
    <Route component={NotFoundView} />
  </Switch>
);
