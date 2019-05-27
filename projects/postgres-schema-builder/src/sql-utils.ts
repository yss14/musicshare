import { Columns } from "./table";
import { topologicalSort } from './topological-sort';
import { SQL } from "./sql";

export function dateToSQLUTCFormat(date: Date) {
	return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth()) + "-" + twoDigits(date.getUTCDate()) + " " + twoDigits(date.getUTCHours()) + ":" + twoDigits(date.getUTCMinutes()) + ":" + twoDigits(date.getUTCSeconds()) + "." + date.getUTCMilliseconds();
}

const twoDigits = (d: number): string => {
	if (0 <= d && d < 10) return "0" + d.toString();
	if (-10 < d && d < 0) return "-0" + (-1 * d).toString();

	return d.toString();
}

export const composeCreateTableStatements = <Tables extends { [name: string]: Columns }>(tables: Tables) =>
	sortTableDependencies(tables)
		.map(([name, columns]) => SQL.createTable(name, columns));

const sortTableDependencies = (tables: Record<string, Columns>) => {
	const tablesSorted = topologicalSort(
		Object.entries(tables),
		([name]) => name,
		function* columns([table, columns]) {
			for (const value of Object.values(columns)) {
				if (value.foreignKeys) {
					for (const foreignKey of value.foreignKeys) {
						if (foreignKey.targetTable !== table) {
							yield foreignKey.targetTable;
						}
					}
				}
			}
		},
	);

	if (!tablesSorted) {
		throw new Error(`Cannot sort tables due to circular dependencies!`);
	}

	return tablesSorted;
}