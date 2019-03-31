import { IStoreSchema } from './../store.schema';
import { MusicShareAPI } from './../../apis/musicshare-api';
import { Action, AnyAction } from 'redux';
import * as constants from './user.constants';
import { IUserSchema } from './user.schema';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';

export interface IUserLoggedIn {
	type: typeof constants.USER_LOGGED_IN;
	payload: IUserSchema;
}

export const login = (api: MusicShareAPI, email: string, password: string): ThunkAction<Promise<string>, {}, {}, AnyAction> =>
	async (dispatch: ThunkDispatch<IStoreSchema, void, Action>) => {
		// fake login
		const userID = 'f0d8e1f0-aeb1-11e8-a117-43673ffd376b';
		dispatch({
			type: constants.USER_LOGGED_IN,
			payload: {
				id: userID,
				authToken: '',
				refreshToken: '',
				name: 'Some user'
			}
		});
		console.log('return userID');
		return userID;
	};

// export all user actions as union type
export type UserAction = IUserLoggedIn;