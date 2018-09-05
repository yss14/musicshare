import { ThunkDispatch } from 'redux-thunk';
import * as constants from './shares.constants';
import { MusicShareApi } from '../../apis/musicshare-api';
import { IStoreSchema } from '../store.schema';
import * as hash from 'js-sha256';
import { IShareSchema } from './shares.schema';

export interface ISharesFetched {
	type: typeof constants.SHARES_FETCHED;
	payload: IShareSchema[];
}

interface ISharesResult {
	user: {
		shares: {
			id: string;
			name: string;
			userID: string;
			isLibrary: boolean;
		}[];
	};
}

export const fetchShares = (api: MusicShareApi, userID: string) =>
	(dispatch: ThunkDispatch<IStoreSchema, void, ISharesFetched>) => {

		api.query<ISharesResult>(`
			user(id:"${userID}"){
				shares{
					id
					name
					userID
					isLibrary
				}
			}
		`).then(result => {
				dispatch({
					type: constants.SHARES_FETCHED,
					payload: result.user.shares.map(share => ({
						...share,
						idHash: hash.sha256(share.id).substr(0, 8)
					}))
				})
			})
	}

export type SharesAction = ISharesFetched;