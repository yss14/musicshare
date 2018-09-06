import { ThunkDispatch } from 'redux-thunk';
import * as constants from './shares.constants';
import { MusicShareApi } from '../../apis/musicshare-api';
import { IStoreSchema } from '../store.schema';
import * as hash from 'js-sha256';
import { IShareSchema, ISong } from './shares.schema';

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

interface IShareSongsResult {
	share: {
		songs: ISong[];
	}
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
						idHash: hash.sha256(share.id).substr(0, 8),
						songs: []
					}))
				})
			})
	}

export interface IShareSongsFetched {
	type: typeof constants.SHARE_SONGS_FETCHED;
	payload: {
		shareID: string;
		songs: ISong[];
	}
}

export const fetchSongs = (api: MusicShareApi, shareID: string) =>
	(dispatch: ThunkDispatch<IStoreSchema, void, IShareSongsFetched>) => {

		api.query<IShareSongsResult>(`
		share(id:"${shareID}"){
			songs{
				id, title, suffix, year, bpm, dateLastEdit, releaseDate, isRip, artists, remixer, featurings,
				type, genres, label, needsUserAction
			}
		}
	`).then(result => {
				dispatch({
					type: constants.SHARE_SONGS_FETCHED,
					payload: {
						shareID: shareID,
						songs: result.share.songs
					}
				})
			})
	}

export type SharesAction = ISharesFetched | IShareSongsFetched;