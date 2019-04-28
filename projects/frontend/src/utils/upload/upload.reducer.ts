import { IUploadSchema, UploadItemStatus } from "../../schemas/upload.schema";
import { UploadAction } from "./upload.types";
import {
  UPLOAD_FINISHED,
  UPLOAD_PROGRESS,
  UPLOAD_QUEUED,
  UPLOAD_REMOVE,
  UPLOAD_STARTED
} from "./constants";

export function reducer(state: IUploadSchema = [], action: UploadAction) {
  switch (action.type) {
    case UPLOAD_QUEUED:
      return state.concat(action.payload);

    case UPLOAD_STARTED:
      return state.map(upload =>
        upload.hash === action.payload.fileHash
          ? { ...upload, status: UploadItemStatus.Uploading }
          : upload
      );

    case UPLOAD_PROGRESS:
      return state.map(upload =>
        upload.hash === action.payload.fileHash
          ? { ...upload, progress: action.payload.progress }
          : upload
      );

    case UPLOAD_FINISHED:
      return state.map(upload =>
        upload.hash === action.payload.fileHash
          ? {
              ...upload,
              status: action.payload.success
                ? UploadItemStatus.Uploaded
                : UploadItemStatus.Failed
            }
          : upload
      );

    case UPLOAD_REMOVE:
      return state.filter(upload => upload.hash !== action.payload.fileHash);

    default:
      return state;
  }
}
