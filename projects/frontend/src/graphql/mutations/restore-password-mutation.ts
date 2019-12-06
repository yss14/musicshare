import gql from "graphql-tag";
import { IMutationOptions } from "../hook-types";
import { useMutation, MutationResult } from "react-apollo";
import { useCallback } from "react";

interface IRestorePasswordData {
	restorePassword: string;
}

interface IRestorePasswordInput {
	email: string;
	restoreToken: string;
	newPassword: string;
}

interface IRestorePasswordVariables {
	input: IRestorePasswordInput;
}

const RESTORE_PASSWORD = gql`
	mutation RestorePassword($input: RestorePasswordInput!) {
		restorePassword(input: $input)
	}
`

export const useRestorePassword = (opts?: IMutationOptions<IRestorePasswordData>) => {
	const [restorePasswordMutation, other] = useMutation<IRestorePasswordData, IRestorePasswordVariables>(
		RESTORE_PASSWORD, opts)

	const restorePassword = useCallback((input: IRestorePasswordInput) => {
		restorePasswordMutation({
			variables: { input }
		})
	}, [restorePasswordMutation])

	return [restorePassword, other] as [(input: IRestorePasswordInput) => void, MutationResult<IRestorePasswordData>]
}