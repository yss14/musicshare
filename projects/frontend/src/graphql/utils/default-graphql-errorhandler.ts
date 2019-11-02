import { History } from 'history'
import { ApolloError } from 'apollo-client'
import { GraphQLError } from 'graphql'

export interface IErrorActions {
	notFound: (error: GraphQLError) => any,
	default: (error: GraphQLError) => any,
}

export const defaultGraphQLErrorHandler = (history: History, customErrorActions?: Partial<IErrorActions>) => (errorResponse: ApolloError) => {
	const defaultErrorActions: IErrorActions = {
		notFound: () => history.push('/404'),
		default: error => console.error(error),
	}
	const errorActions: IErrorActions = {
		...defaultErrorActions,
		...customErrorActions,
	}

	for (const error of errorResponse.graphQLErrors) {
		console.log(error)
		if (!error.extensions) continue

		if (error.extensions.code === 'FORBIDDEN') {
			if (error.message.indexOf(' not found') > -1) {
				errorActions.notFound(error)
			} else {
				alert(error.message)
			}
		}
	}
}
