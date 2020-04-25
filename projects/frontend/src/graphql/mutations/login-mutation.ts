import gql from "graphql-tag"
import { useMutation } from "@apollo/react-hooks"
import { DataProxy } from "apollo-cache"
import { IMutationOptions } from "../hook-types"
import { useCallback } from "react"
import { MutationUpdaterFn } from "apollo-client"
import { MutationResult } from "react-apollo"

export interface ILoginVariables {
	password: string
	email: string
}

export interface ILoginData {
	login: {
		authToken: string
		refreshToken: string
	}
}

export const LOGIN = gql`
	mutation login($password: String!, $email: String!) {
		login(password: $password, email: $email) {
			authToken
			refreshToken
		}
	}
`

export const useLogin = (opts?: IMutationOptions<ILoginData>) => {
	const [loginMutation, other] = useMutation<ILoginData, ILoginVariables>(LOGIN, opts)

	const updateCache = useCallback<MutationUpdaterFn<ILoginData>>((cache: DataProxy, { data }) => {
		cache.writeData({
			data: {
				authToken: data!.login.authToken,
				refreshToken: data!.login.refreshToken,
			},
		})
		localStorage.setItem("auth-token", data!.login.authToken)
		localStorage.setItem("refresh-token", data!.login.refreshToken)
	}, [])

	const login = useCallback(
		(email: string, password: string) => {
			loginMutation({
				variables: {
					email,
					password,
				},
				update: updateCache,
			})
		},
		[loginMutation, updateCache],
	)

	return [login, other] as [(email: string, password: string) => void, MutationResult<ILoginData>]
}
