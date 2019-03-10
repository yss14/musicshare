import { AxiosError, AxiosResponse } from "axios";

interface AxiosErrorWithResponse extends AxiosError {
	response: AxiosResponse;
}

export const isAxiosErrorWithResponse = (error: Object): error is AxiosErrorWithResponse => {
	return error.hasOwnProperty('config') && error.hasOwnProperty('response');
}