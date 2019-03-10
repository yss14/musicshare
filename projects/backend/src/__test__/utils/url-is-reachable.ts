import axios from 'axios';
import { isAxiosErrorWithResponse } from '../../type-guards/is-axios-error';

export const urlIsReachable = async (remoteUrl: string) => {
	try {
		const response = await axios.head(remoteUrl);

		return response.status >= 200 && response.status <= 204;
	} catch (err) {
		if (isAxiosErrorWithResponse(err)) {
			return err.response.status >= 200 && err.response.status <= 204;
		}
	}

	return false;
}