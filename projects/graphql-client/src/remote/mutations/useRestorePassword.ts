import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

interface IRestorePasswordData {
	restorePassword: string
}

interface IRestorePasswordInput {
	email: string
	restoreToken: string
	newPassword: string
}

interface IRestorePasswordVariables {
	input: IRestorePasswordInput
}

const RESTORE_PASSWORD = TransformedGraphQLMutation<IRestorePasswordData, IRestorePasswordVariables>(gql`
	mutation RestorePassword($input: RestorePasswordInput!) {
		restorePassword(input: $input)
	}
`)((data) => data.restorePassword)

export const useRestorePassword = (opts?: IGraphQLMutationOpts<typeof RESTORE_PASSWORD>) => {
	const mutation = useGraphQLMutation(RESTORE_PASSWORD, opts)

	return mutation
}
