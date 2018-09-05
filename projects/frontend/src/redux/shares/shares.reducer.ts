import { ISharesSchema } from './shares.schema';
import * as constants from './shares.constants';
import { SharesAction } from './shares.actions';

const defaultState: ISharesSchema = [];

export const sharesReducer = (state: ISharesSchema = defaultState, action: SharesAction): ISharesSchema => {
	switch (action.type) {
		case constants.SHARES_FETCHED:
			return action.payload;

		default:
			return state;
	}
}