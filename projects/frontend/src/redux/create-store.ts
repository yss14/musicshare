import { UserAction } from './user/user.actions';
import { combineReducers, compose, Store, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { IStoreSchema } from './store.schema';
import { userReducer } from './user/user.reducer';
import { sharesReducer } from './shares/shares.reducer';
import { routerMiddleware } from 'react-router-redux';
import { History } from 'history';

const rootReducer = combineReducers<IStoreSchema>({
	user: userReducer,
	shares: sharesReducer
});

const windowIFDefined = typeof window === 'undefined' ? null : window as Window;

const composeEnhancers = (windowIFDefined as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

type Actions = UserAction;

export const createReduxStore = (browserHistory: History): Store<IStoreSchema> => createStore<IStoreSchema, Actions, any, any>(
	rootReducer,
	composeEnhancers(
		applyMiddleware(
			thunk,
			routerMiddleware(browserHistory)
		),
	)
);