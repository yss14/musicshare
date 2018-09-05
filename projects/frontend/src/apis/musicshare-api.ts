import axios, { AxiosInstance } from 'axios';

interface IGraphQLRequestVariables {
	[key: string]: any
}

interface IGraphQLRequest {
	operationName?: string;
	query: string;
	variables?: IGraphQLRequestVariables;
}

interface IGraphQLError {
	message: string;
	locations?: { column: number, line: number }[]
}

interface IGraphQLResponse<T> {
	errors?: IGraphQLError[];
	data?: T;
}

export class GraphQLError extends Error {
	public readonly errors: IGraphQLError[];

	constructor(message: string, errors: IGraphQLError[]) {
		super(message);

		this.errors = errors;
	}
}

export class MusicShareApi {
	private readonly axiosInstance: AxiosInstance;

	constructor(backendUrl: string) {
		this.axiosInstance = axios.create({
			baseURL: backendUrl
		});
	}

	public async query<R>(query: string, variables?: IGraphQLRequestVariables): Promise<R> {
		const body: IGraphQLRequest = {
			operationName: null,
			query: `query{${query}}`,
			variables: variables || {}
		}

		const response = await this.axiosInstance.post<IGraphQLResponse<R>>('/graphql', body);

		if (response.data.errors) {
			throw new GraphQLError(`Error during GraphQL query \n${query}`, response.data.errors);
		}

		return response.data.data;
	}
}