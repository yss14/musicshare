import { AxiosError, AxiosResponse } from "axios";

export const isAxiosError = (error: Object): error is AxiosError => {
	return error.hasOwnProperty('config');
}

interface AxiosErrorWithResponse extends AxiosError {
	response: AxiosResponse;
}

export const isAxiosErrorWithResponse = (error: Object): error is AxiosErrorWithResponse => {
	return error.hasOwnProperty('config') && error.hasOwnProperty('response');
}