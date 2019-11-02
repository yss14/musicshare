import { History } from 'history'
import { ApolloError } from 'apollo-client'

export const defaultGraphQLErrorHandler = (history: History) => (errorResponse: ApolloError) => {
	for (const error of errorResponse.graphQLErrors) {
		if (!error.extensions) continue

		if (error.extensions.code === 'FORBIDDEN') {
			if (error.message.indexOf(' not found') > -1) {
				history.push('/404')
			} else {
				alert(error.message)
			}
		}
	}
}
