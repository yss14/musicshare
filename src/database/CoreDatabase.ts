import { DatabaseConnection } from "./DatabaseConnection";
import { songsByShare, users, sharesByUser } from "./schema/initial-schema";
import { seedDatabase } from "./seed";
import { NodeEnv } from "../types/common-types";
import { Service, Inject } from "typedi";

interface ISystemSchemaDBResult {
	keyspace_name: string;
	table_name: string;
}

interface ICreateSchemaOpts {
	clear?: boolean;
}

@Service()
export class CoreDatabase {
	@Inject()
	private databaseConnection!: DatabaseConnection;

	public async createSchema(opts?: ICreateSchemaOpts): Promise<void> {
		const clearKeySpace = opts && opts.clear || false;

		if (clearKeySpace) {
			await this.clearKeySpace();
		}

		await Promise.all([
			this.databaseConnection.execute(users()),
			this.databaseConnection.execute(sharesByUser()),
			this.databaseConnection.execute(songsByShare())
		]);

		await seedDatabase(this.databaseConnection, process.env.NODE_ENV as NodeEnv.Development || NodeEnv.Development);
	}

	private async clearKeySpace(): Promise<void> {
		const rows = (await this.databaseConnection.select<ISystemSchemaDBResult>(`
			SELECT * FROM system_schema.tables WHERE keyspace_name = ?;
		`, ['musicshare']));

		for (const row of rows) {
			await this.databaseConnection.execute(`
				DROP TABLE ${row.table_name};
			`)
		}
	}
}