import { useMutation, MutationConfig } from "react-query"
import { useUpdateAuth } from "./useUpdateAuth"

export const useLogout = (opts?: MutationConfig<void, unknown, void>) => {
	const [updateAuth] = useUpdateAuth()

	const mutation = useMutation(() => {
		return updateAuth({
			authToken: null,
			refreshToken: null,
		})
	}, opts)

	return mutation
}
