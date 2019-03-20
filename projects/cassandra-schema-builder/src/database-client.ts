import * as cassandra from 'cassandra-driver';
import { Columns, IQuery, TableRecord } from './table';

type QueryRows<T> = (TableRecord<Extract<T, Columns>> & cassandra.types.Row)[];

export interface IDatabaseClient {
	query<T extends Columns>(query: IQuery<T>): Promise<QueryRows<T>>;
	execute(cql: string): Promise<void>;
	close(): Promise<void>;
}

export class DatabaseClient implements IDatabaseClient {
	constructor(
		private readonly cassandraClient: cassandra.Client
	) { }

	public async query<T extends Columns>(query: IQuery<T>): Promise<QueryRows<T>> {
		const dbResult = await this.cassandraClient.execute(query.cql, query.values);

		return dbResult.rows as any as QueryRows<T>;
	}

	public async execute(cql: string) {
		await this.cassandraClient.execute(cql);
	}

	public close() {
		return new Promise<void>((resolve) => {
			this.cassandraClient.shutdown(() => resolve());
		});
	}
}