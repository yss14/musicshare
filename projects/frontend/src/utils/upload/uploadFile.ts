import {
	UPLOAD_FINISHED,
	UPLOAD_PROGRESS,
	UPLOAD_QUEUED,
	UPLOAD_REMOVE,
	UPLOAD_STARTED
} from "./constants";
import { blobToArrayBuffer } from "./blob-to-arraybuffer";
import * as crypto from "js-sha256";
import { upload } from "./upload";
import { IConfig } from "../../config";
import { UploadItemType, UploadItemStatus } from "../../graphql/rest-types";

interface IAxiosProgress {
	total?: number;
	loaded?: number;
}

let currentUploads: number = 0;

interface IUploadProps {
	children: (state: any, dispatch: any) => React.ReactNode;
}

export const uploadFile = (
	userID: string,
	shareID: string,
	file: File,
	config: IConfig,
) => async (dispatch: any) => {
	const arrayBuffer = await blobToArrayBuffer(file);
	const hash = crypto.sha256(arrayBuffer);
	console.log(shareID);
	dispatch({
		type: UPLOAD_QUEUED,
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

	await new Promise<void>(resolve => {
		const checkIntervall = setInterval(() => {
			if (currentUploads <= 1) {
				clearInterval(checkIntervall);

				resolve();
			}
		}, 500);
	});

	dispatch({
		type: UPLOAD_STARTED,
		payload: {
			fileHash: hash
		}
	});

	const onProgress = (progress: IAxiosProgress) => {
		console.log(progress);

		if (progress.loaded && progress.total) {
			dispatch({
				type: UPLOAD_PROGRESS,
				payload: {
					fileHash: hash,
					progress: (progress.loaded / progress.total) * 100
				}
			});
		}
	};

	try {
		currentUploads++;

		await upload(userID, shareID, file, arrayBuffer, onProgress, config);

		dispatch({
			type: UPLOAD_FINISHED,
			payload: {
				fileHash: hash,
				success: true
			}
		});
	} catch (err) {
		console.error(err);

		dispatch({
			type: UPLOAD_FINISHED,
			payload: {
				fileHash: hash,
				success: false
			}
		});
	} finally {
		currentUploads--;

		setTimeout(() => {
			dispatch({
				type: UPLOAD_REMOVE,
				payload: {
					fileHash: hash
				}
			});
		}, 2000);
	}
};
