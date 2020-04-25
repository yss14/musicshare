import { ApolloError } from "apollo-client"

export interface IMutationOptions<TData = unknown> {
	onCompleted?: (data: TData) => any
	onError?: (error: ApolloError) => any
}
