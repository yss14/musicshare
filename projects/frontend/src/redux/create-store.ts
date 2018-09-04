import { UserAction } from './user/user.actions';
import { combineReducers, compose, Store, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { IStoreSchema } from './store.schema';
import { userReducer } from './user/user.reducer';

const rootReducer = combineReducers<IStoreSchema>({
	user: userReducer
});

const windowIFDefined = typeof window === 'undefined' ? null : window as Window;

const composeEnhancers = (windowIFDefined as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

type Actions = UserAction;

export const createReduxStore = (): Store<IStoreSchema> => createStore<IStoreSchema, Actions, any, any>(
	rootReducer,
	composeEnhancers(
		applyMiddleware(thunk),
	)
);