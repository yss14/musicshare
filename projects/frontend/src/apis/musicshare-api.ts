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

export interface IAxiosProgress {
	total?: number;
	loaded?: number;
}

export class GraphQLError extends Error {
	public readonly errors: IGraphQLError[];

	constructor(message: string, errors: IGraphQLError[]) {
		super(message);

		this.errors = errors;
	}
}

export class MusicShareAPI {
	private readonly axiosInstance: AxiosInstance;

	constructor(backendUrl: string) {
		this.axiosInstance = axios.create({
			baseURL: backendUrl
		});
	}

	public async query<R>(query: string, variables?: IGraphQLRequestVariables): Promise<R> {
		const body: IGraphQLRequest = {
			operationName: undefined,
			query: `query{${query}}`,
			variables: variables || {}
		}

		const response = await this.axiosInstance.post<IGraphQLResponse<R>>('/graphql', body);

		if (response.data.errors) {
			throw new GraphQLError(`Error during GraphQL query \n${query}`, response.data.errors);
		}

		if (response.data.data) {
			return response.data.data;
		} else {
			throw new GraphQLError('No data received', []);
		}
	}

	public async upload(userID: string, shareID: string, file: File, buffer: ArrayBuffer, onProgress: (progress: IAxiosProgress) => void): Promise<void> {
		await this.axiosInstance.post<void>(
			`/users/${userID}/shares/${shareID}/files/${file.name}`,
			buffer,
			{
				onUploadProgress: onProgress
			}
		);
	}
}