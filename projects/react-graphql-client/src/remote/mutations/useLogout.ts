import { useMutation, UseMutationOptions } from "react-query"
import { useUpdateAuth } from "./useUpdateAuth"

export const useLogout = (opts?: UseMutationOptions<void, unknown, void>) => {
	const { mutateAsync: updateAuth } = useUpdateAuth()

	const mutation = useMutation(() => {
		return updateAuth({
			authToken: null,
			refreshToken: null,
		})
	}, opts)

	return mutation
}
