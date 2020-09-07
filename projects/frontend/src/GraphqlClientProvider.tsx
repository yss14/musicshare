import {
	GraphQLClient,
	IGraphQLResponse,
	GraphQLClientContext,
	useLogout,
	useIssueAuthToken,
	useUpdateAuth,
} from "@musicshare/graphql-client"
import axios, { AxiosError, AxiosResponse } from "axios"
import { useConfig } from "./hooks/use-config"
import React, { useMemo, useCallback, useRef } from "react"
import { message } from "antd"

export const GraphQLClientProvider: React.FC = ({ children }) => {
	const config = useConfig()
	const [logout] = useLogout()
	const [issueAuthToken] = useIssueAuthToken()
	const [updateAuth] = useUpdateAuth()

	const refreshAuthTokenPromise = useRef<Promise<string> | null>(null)

	const getFreshAuthToken = useCallback(async () => {
		const refreshToken = localStorage.getItem("musicshare.refreshToken")

		if (!refreshToken) {
			throw new Error(`refreshToken is not set, can't request new auth token`)
		}

		const newAuthToken = await issueAuthToken({ refreshToken })

		if (!newAuthToken) {
			throw new Error(`Can't request new auth token`)
		}

		updateAuth({ authToken: newAuthToken })

		refreshAuthTokenPromise.current = null

		return newAuthToken
	}, [issueAuthToken, updateAuth])

	const graphQLClient = useMemo(() => {
		const client = GraphQLClient({ baseURL: config.services.musicshare.backendURL })

		client.useRequestMiddleware((request) => {
			request.headers["Authorization"] = localStorage.getItem("musicshare.authToken")

			return request
		})

		client.useResponseMiddleware(
			async (response: AxiosResponse<IGraphQLResponse<unknown>>) => {
				if (response.data.errors) {
					for (const error of response.data.errors) {
						console.log(error.message)
						if (error.message === "Access denied! You need to be authorized to perform this action!") {
							if (window.location.pathname !== "/login") {
								logout()
								message.error("You need to be authenticated to access this ressource. Please sign in!")
							}
						} else if (error.message === "AuthToken expired") {
							if (!refreshAuthTokenPromise.current) {
								refreshAuthTokenPromise.current = getFreshAuthToken()
							}

							const newAuthToken = await refreshAuthTokenPromise.current
							response.config.headers["Authorization"] = newAuthToken

							const newResponse = await axios(response.config)

							return newResponse
						} else if (error.message.startsWith("User with id") && error.message.endsWith("not found")) {
							logout()
							message.error(
								"Ups, this operation failed. We logged you out for safety reasons. Please sign in again!",
							)
						}
					}
				}

				return response
			},
			(error: AxiosError) => {
				if (!error.response && error.request) {
					message.warning("We detected some network issues. You may want check your internet connection.", 10)
				}

				Promise.reject(error)
			},
		)

		return client
	}, [config, getFreshAuthToken, logout])

	return <GraphQLClientContext.Provider value={graphQLClient}>{children}</GraphQLClientContext.Provider>
}
