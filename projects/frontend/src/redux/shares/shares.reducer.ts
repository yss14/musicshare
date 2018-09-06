import { ISharesSchema } from './shares.schema';
import * as constants from './shares.constants';
import { SharesAction } from './shares.actions';

const defaultState: ISharesSchema = [];

export const sharesReducer = (state: ISharesSchema = defaultState, action: SharesAction): ISharesSchema => {
	switch (action.type) {
		case constants.SHARES_FETCHED:
			return action.payload;

		case constants.SHARE_SONGS_FETCHED:
			return state.map(share => share.id === action.payload.shareID
				? {
					...share,
					songs: action.payload.songs
				} : share
			)

		default:
			return state;
	}
}