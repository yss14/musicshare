import gql from "graphql-tag"
import { TransformedGraphQLMutation, useGraphQLMutation, IGraphQLMutationOpts } from "../../react-query-graphql"
import { Viewer, userKeys } from "@musicshare/shared-types"

export interface IRegisterVariables {
	name: string
	email: string
	password: string
	captchaID: string
	captchaSolution: string
}

export interface IRegisterData {
	register: {
		user: Viewer
		restoreToken: string
	}
}

export const REGISTER = TransformedGraphQLMutation<IRegisterData, IRegisterVariables>(gql`
	mutation register($name: String! $password: String! $email: String! $captchaID: String! $captchaSolution: String!) {
		register(name: $name password: $password email: $email captchaID: $captchaID captchaSolution: $captchaSolution) {
			user {
				${userKeys}
			}
			restoreToken
		}
	}
`)((data) => data.register)

export const useRegister = (opts?: IGraphQLMutationOpts<typeof REGISTER>) => {
	const mutation = useGraphQLMutation(REGISTER, opts)

	return mutation
}
