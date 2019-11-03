import gql from "graphql-tag";

export interface IIssueAuthTokenVariables {
	refreshToken: string;
}

export interface IIssueAuthTokenData {
	issueAuthToken: string;
}

export const ISSUE_AUTH_TOKEN = gql`
	mutation issueAuthToken($refreshToken: String!){
		issueAuthToken(refreshToken: $refreshToken)
	}
`
