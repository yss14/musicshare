import * as cassandra from 'cassandra-driver';

interface IInsertOptions {
	ifNotExists?: boolean;
}

export interface IBatchQuery {
	query: string;
	params?: any[];
}

export class Database {
	private _connection: cassandra.Client;

	constructor(opts: cassandra.ClientOptions) {
		this._connection = new cassandra.Client(opts);
	}

	public execute(query: string, params?: any, options?: cassandra.QueryOptions) {
		return this._connection.execute(query, params, options);
	}

	public select<T>(query: string, params?: any, options?: cassandra.QueryOptions): Promise<T[]> {
		return this._connection.execute(query, params, options)
			// enables convinient access to the keys of each row object result
			.then(results => results.rows as any as T[]);
	}

	public async batch(queries: IBatchQuery[], options?: cassandra.QueryOptions) {
		return this._connection.batch(queries, options);
	}
}