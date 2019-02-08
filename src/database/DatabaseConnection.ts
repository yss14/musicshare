import * as cassandra from 'cassandra-driver';

export interface IBatchQuery {
	query: string;
	params?: any[];
}

export type QueryParam = any;
export type ResultSet = cassandra.types.ResultSet;

export class DatabaseConnection {
	private _connection: cassandra.Client;

	constructor(opts: cassandra.ClientOptions) {
		this._connection = new cassandra.Client(opts);
	}

	public execute(query: string): Promise<ResultSet>;
	public execute(query: string, params: QueryParam[]): Promise<ResultSet>;
	public execute(query: string, options: cassandra.QueryOptions): Promise<ResultSet>;
	public execute(query: string, params: QueryParam[], options: cassandra.QueryOptions): Promise<ResultSet>;
	public execute(query: string, paramsOrOptions?: QueryParam[] | cassandra.QueryOptions, options?: cassandra.QueryOptions): Promise<ResultSet> {
		const evaluatedParams = paramsOrOptions instanceof Array ? paramsOrOptions : undefined;
		const evaluatedOptions = !(paramsOrOptions instanceof Array) ? paramsOrOptions : options;

		return this._connection.execute(query, evaluatedParams, evaluatedOptions);
	}

	public select<T>(query: string): Promise<T[]>
	public select<T>(query: string, params: QueryParam[]): Promise<T[]>
	public select<T>(query: string, options: cassandra.QueryOptions): Promise<T[]>
	public select<T>(query: string, params: QueryParam[], options: cassandra.QueryOptions): Promise<T[]>
	public select<T>(query: string, paramsOrOptions?: QueryParam[] | cassandra.QueryOptions, options?: cassandra.QueryOptions): Promise<T[]> {
		const evaluatedParams = paramsOrOptions instanceof Array ? paramsOrOptions : undefined;
		const evaluatedOptions = !(paramsOrOptions instanceof Array) ? paramsOrOptions : options;

		return this._connection.execute(query, evaluatedParams, evaluatedOptions)
			// enables convinient access to the keys of each row object result
			.then(results => results.rows as any as T[]);
	}

	public async batch(queries: IBatchQuery[]): Promise<ResultSet>;
	public async batch(queries: IBatchQuery[], options: cassandra.QueryOptions): Promise<ResultSet>;
	public async batch(queries: IBatchQuery[], options?: cassandra.QueryOptions): Promise<ResultSet> {
		return this._connection.batch(queries, options);
	}
}