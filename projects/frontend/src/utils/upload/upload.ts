import axios from "axios";
import { IConfig } from "../../config";

interface IAxiosProgress {
	total?: number;
	loaded?: number;
}

export const upload = async (
	userID: string,
	shareID: string,
	playlistIDs: string[],
	file: File,
	buffer: ArrayBuffer,
	onProgress: (progress: IAxiosProgress) => void,
	config: IConfig,
): Promise<void> => {
	await axios.post<void>(
		`${config.services.musicshare.backendURL}/users/${userID}/shares/${shareID}/files/${file.name}?${playlistIDs.map(id => `playlistID=${id}`).join('&')}`,
		buffer,
		{
			onUploadProgress: onProgress,
			headers: {
				authorization: localStorage.getItem("auth-token"),
			}
		}
	);
};
