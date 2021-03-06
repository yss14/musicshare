import {
	IGraphQLMutationOpts,
	useGraphQLMutation,
	TransformedGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import gql from "graphql-tag"
import { GET_AUTH } from "../queries/useAuth"

export interface IUpdateAuthVariables {
	authToken?: string | null
	refreshToken?: string | null
}

export const UPDATE_AUTH = TransformedGraphQLMutation<void, IUpdateAuthVariables>(gql`
	mutation updateAuth {
		updateAuth # client mutation
	}
`)((data) => data)

export const useUpdateAuth = (opts?: IGraphQLMutationOpts<typeof UPDATE_AUTH>) => {
	const mutation = useGraphQLMutation(UPDATE_AUTH, {
		resolver: ({ variables: { authToken, refreshToken } }) => {
			if (authToken !== undefined) {
				if (authToken === null) {
					localStorage.removeItem("musicshare.authToken")
				} else {
					localStorage.setItem("musicshare.authToken", authToken)
				}
			}

			if (refreshToken !== undefined) {
				if (refreshToken === null) {
					localStorage.removeItem("musicshare.refreshToken")
				} else {
					localStorage.setItem("musicshare.refreshToken", refreshToken)
				}
			}
		},
		onSuccess: (data, variables, context) => {
			typedQueryClient.invalidateTypedQuery({
				query: GET_AUTH,
			})

			if (opts?.onSuccess) opts.onSuccess(data, variables, context)
		},
	})

	return mutation
}
