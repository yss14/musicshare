import axios from 'axios';
import { isAxiosErrorWithResponse } from '../../type-guards/is-axios-error';

export const urlIsReachable = async (remoteUrl: string, method: 'head' | 'get' = 'head') => {
	try {
		const response = method === 'head'
			? await axios.head(remoteUrl)
			: await axios.get(remoteUrl);

		return response.status >= 200 && response.status <= 204;
	} catch (err) {
		if (isAxiosErrorWithResponse(err)) {
			return err.response.status >= 200 && err.response.status <= 204;
		}
	}

	return false;
}
