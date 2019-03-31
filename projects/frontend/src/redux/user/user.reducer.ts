import { IUserSchema } from './user.schema';
import { UserAction } from './user.actions';
import * as constants from './user.constants';

const defaultState: IUserSchema = {
	id: null,
	name: null,
	authToken: null,
	refreshToken: null
}

export const userDefaultState = defaultState;

export const userReducer = (state: IUserSchema = defaultState, action: UserAction): IUserSchema => {
	switch (action.type) {
		case constants.USER_LOGGED_IN:
			return {
				...state,
				...action.payload
			}

		default:
			return state;
	}
}