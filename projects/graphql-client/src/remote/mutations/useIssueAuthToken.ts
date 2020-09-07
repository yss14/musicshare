import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

export interface IIssueAuthTokenData {
	issueAuthToken: string
}

export interface IIssueAuthTokenVariables {
	refreshToken: string
}

export const ISSUE_AUTH_TOKEN = TransformedGraphQLMutation<IIssueAuthTokenData, IIssueAuthTokenVariables>(gql`
	mutation issueAuthToken($refreshToken: String!) {
		issueAuthToken(refreshToken: $refreshToken)
	}
`)((data) => data.issueAuthToken)

export const useIssueAuthToken = (opts?: IGraphQLMutationOpts<typeof ISSUE_AUTH_TOKEN>) => {
	const mutation = useGraphQLMutation(ISSUE_AUTH_TOKEN, opts)

	return mutation
}
