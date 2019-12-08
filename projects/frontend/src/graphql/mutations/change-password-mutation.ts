import gql from "graphql-tag";
import { useMutation, MutationResult } from "react-apollo";
import { useCallback } from "react";
import { IMutationOptions } from "../hook-types";

interface IChangePasswordData {
	changePassword: boolean;
}

interface IChangePasswordInput {
	oldPassword: string;
	newPassword: string;
}

interface IChangePasswordVariables {
	input: IChangePasswordInput;
}

const CHANGE_PASSWORD = gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input)
	}
`

export const useChangePassword = (opts?: IMutationOptions<IChangePasswordData>) => {
	const [changePasswordMutation, other] = useMutation<IChangePasswordData, IChangePasswordVariables>(CHANGE_PASSWORD, opts)

	const changePassword = useCallback((input: IChangePasswordInput) => {
		changePasswordMutation({
			variables: { input },
		})
	}, [changePasswordMutation])

	return [changePassword, other] as [(input: IChangePasswordInput) => void, MutationResult<IChangePasswordData>]
}
