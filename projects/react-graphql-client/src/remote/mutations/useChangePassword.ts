import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

export interface IChangePasswordData {
	changePassword: boolean
}

export interface IChangePasswordInput {
	oldPassword: string
	newPassword: string
}

export interface IChangePasswordVariables {
	input: IChangePasswordInput
}

export const CHANGE_PASSWORD = TransformedGraphQLMutation<IChangePasswordData, IChangePasswordVariables>(gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input)
	}
`)((data) => data.changePassword)

export const useChangePassword = (opts?: IGraphQLMutationOpts<typeof CHANGE_PASSWORD>) => {
	const mutation = useGraphQLMutation(CHANGE_PASSWORD, opts)

	return mutation
}
