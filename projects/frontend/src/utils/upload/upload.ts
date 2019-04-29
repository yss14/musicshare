import axios from "axios";
import { IConfig } from "../../config";

interface IAxiosProgress {
	total?: number;
	loaded?: number;
}

export const upload = async (
	userID: string,
	shareID: string,
	file: File,
	buffer: ArrayBuffer,
	onProgress: (progress: IAxiosProgress) => void,
	config: IConfig,
): Promise<void> => {
	await axios.post<void>(
		`http://127.0.0.1:4000/users/${userID}/shares/${shareID}/files/${file.name}`,
		buffer,
		{
			onUploadProgress: onProgress,
			headers: {
				authorization: config.services.musicshare.authTokenDev
			}
		}
	);
};
