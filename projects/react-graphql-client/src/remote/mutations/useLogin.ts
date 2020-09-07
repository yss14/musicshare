import gql from "graphql-tag"
import { TransformedGraphQLMutation, useGraphQLMutation, IGraphQLMutationOpts } from "../../react-query-graphql"
import { useUpdateAuth } from "./useUpdateAuth"

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

export const LOGIN = TransformedGraphQLMutation<ILoginData, ILoginVariables>(gql`
	mutation login($password: String!, $email: String!) {
		login(password: $password, email: $email) {
			authToken
			refreshToken
		}
	}
`)((data) => data.login)

export const useLogin = (opts?: IGraphQLMutationOpts<typeof LOGIN>) => {
	const [updateAuth] = useUpdateAuth()

	const mutation = useGraphQLMutation(LOGIN, {
		...opts,
		onSuccess: async (data, variables) => {
			await updateAuth(data)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
