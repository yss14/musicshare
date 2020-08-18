import axios, { AxiosRequestConfig } from "axios"

export const GraphQLClient = (opts?: AxiosRequestConfig) => {
	const client = axios.create({
		...opts,
	})

	const registerInterceptor = () => {
		client.interceptors.request()
	}
}
