import * as React from 'react';
import { MusicShareApi } from './apis/musicshare-api';
import { createReduxStore } from './redux/create-store';
import { login } from './redux/user/user.actions';
import { ThunkDispatch } from 'redux-thunk';
import { IStoreSchema } from './redux/store.schema';
import { Action } from 'redux';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { MainView } from './components/views/main/MainView';
import { createGlobalStyle } from 'styled-components';
import { createBrowserHistory } from 'history';
import { NotFoundView } from './components/views/not-found/NotFound';

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

export const Root = () => (
	<Provider store={store}>
		<GlobalStyle>
			<Router history={history}>
				<Route path="/" component={App} />
			</Router>
		</GlobalStyle>
	</Provider>
);

const Login: React.StatelessComponent = () => (
	<h1>Login</h1>
);

class App extends React.Component {
	private readonly api: MusicShareApi;

	constructor(props: {}) {
		super(props);

		this.api = new MusicShareApi(process.env.REACT_APP_MUSICSHARE_BACKEND_URL!); // TODO undefined check
	}

	public componentDidMount() {
		// fake login
		const dispatch: ThunkDispatch<IStoreSchema, void, Action> = store.dispatch;

		dispatch(login(this.api, "", ""));
	}

	public render() {
		return (
			<Switch>

				<Route path="/login" component={Login} />
				<Route path="/shares/:shareID/" component={MainView} />
				<Route component={NotFoundView} />
			</Switch>
		);
	}
}