import { blobToArrayBuffer } from './../../utils/blob-to-arraybuffer';
import { IUploadItem, UploadItemType, UploadItemStatus } from './upload.schema';
import { ThunkDispatch } from 'redux-thunk';
import { MusicShareApi, IAxiosProgress } from './../../apis/musicshare-api';
import * as constants from './upload.constants';
import { IStoreSchema } from '../store.schema';
import * as crypto from 'js-sha256';

export interface IUploadQueued {
	type: typeof constants.UPLOAD_QUEUED;
	payload: IUploadItem;
}

export interface IUploadStarted {
	type: typeof constants.UPLOAD_STARTED;
	payload: {
		fileHash: string;
	}
}

export interface IUploadProgress {
	type: typeof constants.UPLOAD_PROGRESS;
	payload: {
		fileHash: string;
		progress: number;
	}
}

export interface IUploadFinished {
	type: typeof constants.UPLOAD_FINISHED;
	payload: {
		fileHash: string;
		success: boolean;
	}
}

export interface IUploadRemove {
	type: typeof constants.UPLOAD_REMOVE;
	payload: {
		fileHash: string;
	}
}

let currentUploads: number = 0;

export const upload = (userID: string, shareID: string, api: MusicShareApi, file: File) =>
	async (dispatch: ThunkDispatch<IStoreSchema, void, UploadAction>) => {

		const arrayBuffer = await blobToArrayBuffer(file);
		const hash = crypto.sha256(arrayBuffer);

		dispatch({
			type: constants.UPLOAD_QUEUED,
			payload: {
				type: UploadItemType.Song,
				filename: file.name,
				size: arrayBuffer.byteLength,
				progress: 0,
				status: UploadItemStatus.Queued,
				shareID: shareID,
				hash: hash
			}
		});

		await new Promise<void>((resolve) => {
			const checkIntervall = setInterval(() => {
				if (currentUploads <= 1) {
					clearInterval(checkIntervall);

					resolve();
				}
			}, 500);
		});

		dispatch({
			type: constants.UPLOAD_STARTED,
			payload: {
				fileHash: hash
			}
		});

		const onProgress = (progress: IAxiosProgress) => {
			console.log(progress);

			if (progress.loaded && progress.total) {
				dispatch({
					type: constants.UPLOAD_PROGRESS,
					payload: {
						fileHash: hash,
						progress: (progress.loaded / progress.total) * 100
					}
				});
			}
		}

		try {
			currentUploads++;

			await api.upload(userID, shareID, file, arrayBuffer, onProgress);

			dispatch({
				type: constants.UPLOAD_FINISHED,
				payload: {
					fileHash: hash,
					success: true
				}
			});
		} catch (err) {
			console.error(err);

			dispatch({
				type: constants.UPLOAD_FINISHED,
				payload: {
					fileHash: hash,
					success: false
				}
			});
		}
		finally {
			currentUploads--;

			setTimeout(() => {
				dispatch({
					type: constants.UPLOAD_REMOVE,
					payload: {
						fileHash: hash
					}
				});
			}, 2000);
		}
	}

export type UploadAction = IUploadQueued | IUploadStarted | IUploadProgress | IUploadFinished | IUploadRemove;