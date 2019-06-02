import { Pool, PoolConfig, types } from 'pg';
import { Columns, IQuery, TableRecord } from "./table";

type QueryRows<T> = (TableRecord<Extract<T, Columns>>)[];

export class SQLError extends Error {
	constructor(
		err: Error,
		sql: string,
		values?: unknown[],
	) {
		super(`SQLError: ${err} SQL: ${sql} Values: ${values}`);
	}
}

export interface IDatabaseBaseClient {
	query<T extends Columns>(query: IQuery<T>): Promise<QueryRows<T>>;
}

export interface IDatabaseClient extends IDatabaseBaseClient {
	batch(queries: IQuery<{}>[]): Promise<void>;
	transaction: <T>(task: (client: IDatabaseBaseClient) => Promise<T>) => Promise<T>;
	close(): Promise<void>;
}

export const DatabaseClient = (client: Pool): IDatabaseClient => {
	const query = async <T extends Columns>(query: IQuery<T>): Promise<QueryRows<T>> => {
		try {
			const dbResult = await client.query(query.sql, query.values);

			return dbResult.rows;
		} catch (err) {
			throw new SQLError(err, query.sql, query.values);
		}
	}

	const batch = async (queries: IQuery<{}>[]): Promise<void> => {
		await transaction(async (database) => {
			queries.forEach(database.query);
		});
	}

	const transaction = async <T>(task: (client: IDatabaseBaseClient) => Promise<T>): Promise<T> => {
		const localClient = await client.connect();

		try {
			await localClient.query('BEGIN');

			const result = await task({
				query: (query) => localClient.query(query.sql, query.values).then(result => result.rows)
			});

			await localClient.query("COMMIT");

			return result;
		} catch (err) {
			await localClient.query("ROLLBACK");

			throw err;
		} finally {
			await localClient.release();
		}
	}

	const close = () => {
		return client.end();
	}

	const IOD_DATE = 1082;
	types.setTypeParser(IOD_DATE, date => date);

	return { query, batch, close, transaction };
}

export const postgresConfigFromEnv = (): PoolConfig => {
	const config: PoolConfig = {
		host: process.env.POSTGRES_HOST || 'localhost',
		port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : undefined,
		user: process.env.POSTGRES_USER || 'postgres',
	}

	if (process.env.POSTGRES_DATABASE) {
		config.database = process.env.POSTGRES_DATABASE;
	}

	if (process.env.POSTGRES_PASSWORD) {
		config.password = process.env.POSTGRES_PASSWORD;
	}

	return config;
};