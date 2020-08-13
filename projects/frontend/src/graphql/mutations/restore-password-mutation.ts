import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions } from "@apollo/client"
import { useCallback } from "react"

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

const RESTORE_PASSWORD = gql`
	mutation RestorePassword($input: RestorePasswordInput!) {
		restorePassword(input: $input)
	}
`

export const useRestorePassword = (opts?: MutationHookOptions<IRestorePasswordData, IRestorePasswordVariables>) => {
	const [restorePasswordMutation, other] = useMutation<IRestorePasswordData, IRestorePasswordVariables>(
		RESTORE_PASSWORD,
		opts,
	)

	const restorePassword = useCallback(
		(input: IRestorePasswordInput) => {
			restorePasswordMutation({
				variables: { input },
			})
		},
		[restorePasswordMutation],
	)

	return [restorePassword, other] as [(input: IRestorePasswordInput) => void, MutationResult<IRestorePasswordData>]
}
