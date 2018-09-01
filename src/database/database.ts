import * as cassandra from 'cassandra-driver';

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
			.then(results => results.rows as any as T[]);
	}
}