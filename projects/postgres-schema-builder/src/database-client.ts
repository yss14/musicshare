import { Client, Pool, PoolConfig } from 'pg';
import { Columns, IQuery, TableRecord } from "./table";

type QueryRows<T> = (TableRecord<Extract<T, Columns>>)[];

export interface IDatabaseClient {
	query<T extends Columns>(query: IQuery<T>): Promise<QueryRows<T>>;
	close(): Promise<void>;
}

export const DatabaseClient = (client: Client | Pool): IDatabaseClient => {
	const query = async <T extends Columns>(query: IQuery<T>): Promise<QueryRows<T>> => {
		const dbResult = await client.query(query.sql, query.values);

		return dbResult.rows;
	}

	const close = () => {
		return client.end();
	}

	return { query, close };
}

export const postgresConfigFromEnv = (): PoolConfig => ({
	host: process.env.POSTGRES_HOST,
	port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : undefined,
	database: process.env.POSTGRES_DATABASE,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
});