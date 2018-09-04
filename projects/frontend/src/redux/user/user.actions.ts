import { IStoreSchema } from './../store.schema';
import { MusicShareApi } from './../../apis/musicshare-api';
import { Action } from 'redux';
import * as constants from './user.constants';
import { IUserSchema } from './user.schema';
import { ThunkDispatch } from 'redux-thunk';

export interface IUserLoggedIn {
	type: typeof constants.USER_LOGGED_IN;
	payload: IUserSchema;
}

export const login = (api: MusicShareApi, email: string, password: string) => async (dispatch: ThunkDispatch<IStoreSchema, void, Action>) => {
	// fake login
	dispatch({
		type: constants.USER_LOGGED_IN,
		payload: {
			id: 'f0d8e1f0-aeb1-11e8-a117-43673ffd376b',
			authToken: '',
			refreshToken: '',
			name: 'Some user'
		}
	});
};

// export all user actions as union type
export type UserAction = IUserLoggedIn;