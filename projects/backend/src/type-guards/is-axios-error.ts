import { AxiosError, AxiosResponse } from "axios"

interface AxiosErrorWithResponse extends AxiosError {
	response: AxiosResponse
}

export const isAxiosErrorWithResponse = (error: Object): error is AxiosErrorWithResponse => {
	return (
		Object.prototype.hasOwnProperty.call(error, "config") && Object.prototype.hasOwnProperty.call(error, "response")
	)
}
