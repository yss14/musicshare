import { UploadAction } from './upload.actions';
import { IUploadSchema, UploadItemStatus } from "./upload.schema";
import * as constants from './upload.constants';

const defaultState: IUploadSchema = [];

export const uploadReducer = (state: IUploadSchema = defaultState, action: UploadAction): IUploadSchema => {
	switch (action.type) {
		case constants.UPLOAD_QUEUED:
			return state.concat(action.payload);

		case constants.UPLOAD_STARTED:
			return state.map(upload => upload.hash === action.payload.fileHash
				? { ...upload, status: UploadItemStatus.Uploading } : upload);

		case constants.UPLOAD_PROGRESS:
			return state.map(upload => upload.hash === action.payload.fileHash
				? { ...upload, progress: action.payload.progress } : upload);

		case constants.UPLOAD_FINISHED:
			return state.map(upload => upload.hash === action.payload.fileHash
				? { ...upload, status: action.payload.success ? UploadItemStatus.Uploaded : UploadItemStatus.Failed }
				: upload);

		case constants.UPLOAD_REMOVE:
			return state.filter(upload => upload.hash !== action.payload.fileHash);

		default:
			return state;
	}
}