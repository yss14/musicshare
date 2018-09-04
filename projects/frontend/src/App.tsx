import * as React from 'react';
import { MusicShareApi } from './apis/musicshare-api';
import { createReduxStore } from './redux/create-store';
import { login } from './redux/user/user.actions';
import { ThunkDispatch } from 'redux-thunk';
import { IStoreSchema } from './redux/store.schema';
import { Action } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { MainView } from './components/views/main/MainView';
import { injectGlobal } from 'styled-components';

const store = createReduxStore();

// global styles
// tslint:disable-next-line
injectGlobal`
	html, body, #root {
		margin: 0px;
		padding: 0px;
		width: 100%;
		height: 100%;
	}
`;

export const Root = () => (
	<Provider store={store}>
		<Router>
			<Route path="/" component={App} />
		</Router>
	</Provider>
);

const Login: React.StatelessComponent = () => (
	<h1>Login</h1>
);

class App extends React.Component {
	private readonly api: MusicShareApi;

	constructor(props: {}) {
		super(props);

		this.api = new MusicShareApi(process.env.REACT_APP_MUSICSHARE_BACKEND_URL);
	}

	public componentDidMount() {
		// fake login
		const dispatch: ThunkDispatch<IStoreSchema, void, Action> = store.dispatch;

		dispatch(login(this.api, null, null));
	}

	public render() {
		return (
			<React.Fragment>
				<Route path="/login" component={Login} />
				<Route path="/main" component={MainView} />
			</React.Fragment>
		);
	}
}