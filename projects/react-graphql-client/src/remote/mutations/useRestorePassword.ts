import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

export interface IRestorePasswordData {
	restorePassword: string
}

export interface IRestorePasswordInput {
	email: string
	restoreToken: string
	newPassword: string
}

export interface IRestorePasswordVariables {
	input: IRestorePasswordInput
}

export const RESTORE_PASSWORD = TransformedGraphQLMutation<IRestorePasswordData, IRestorePasswordVariables>(gql`
	mutation RestorePassword($input: RestorePasswordInput!) {
		restorePassword(input: $input)
	}
`)((data) => data.restorePassword)

export const useRestorePassword = (opts?: IGraphQLMutationOpts<typeof RESTORE_PASSWORD>) => {
	const mutation = useGraphQLMutation(RESTORE_PASSWORD, opts)

	return mutation
}
