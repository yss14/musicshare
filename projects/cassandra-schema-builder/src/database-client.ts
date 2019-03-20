import * as cassandra from 'cassandra-driver';
import { Columns, IQuery, TableRecord } from './table';

export interface IDatabaseClient {
	query<T extends Columns>(query: IQuery<T>): Promise<TableRecord<Columns>[]>;
	execute(cql: string): Promise<void>;
	close(): Promise<void>;
}

export class DatabaseClient implements IDatabaseClient {
	constructor(
		private readonly cassandraClient: cassandra.Client
	) { }

	public async query<T extends Columns>(query: IQuery<T>): Promise<TableRecord<Columns>[]> {
		const dbResult = await this.cassandraClient.execute(query.cql, query.values);

		return dbResult.rows;
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