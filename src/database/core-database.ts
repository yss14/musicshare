import { Database } from "./database";
import { songsByShare, users, sharesByUser } from "./schema/initial-schema";

interface ISystemSchemaDBResult {
	keyspace_name: string;
	table_name: string;
}

interface ICreateSchemaOpts {
	clear?: boolean;
}

export class CoreDatabase {
	private _database: Database;

	constructor(database: Database) {
		this._database = database;
	}

	public async createSchema(opts?: ICreateSchemaOpts): Promise<void> {
		const clearKeySpace = opts && opts.clear || false;

		if (clearKeySpace) {
			await this.clearKeySpace();
		}

		await Promise.all([
			this._database.execute(users()),
			this._database.execute(sharesByUser()),
			this._database.execute(songsByShare())
		]);
	}

	private async clearKeySpace(): Promise<void> {
		const rows = (await this._database.select<ISystemSchemaDBResult>(`
			SELECT * FROM system_schema.tables WHERE keyspace_name = ?;
		`, ['musicshare']));

		for (const row of rows) {
			await this._database.execute(`
				DROP TABLE ${row.table_name};
			`)
		}
	}
}