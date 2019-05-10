import { Permission, Permissions } from "../auth/permissions";
import { IDatabaseClient } from "cassandra-schema-builder";
import { PermissionsByUserTable } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";

export interface IPermissionService {
	getPermissionsForUser(userID: string): Promise<Permission[]>;
	addPermissionsForUser(userID: string, permissions: Permission[]): Promise<void>;
}

interface IPermissionServiceArgs {
	database: IDatabaseClient;
}

export const PermissionService = ({ database }: IPermissionServiceArgs): IPermissionService => {
	const getPermissionsForUser = async (userID: string): Promise<Permission[]> => {
		const dbResults = await database.query(
			PermissionsByUserTable.select(['permission'], ['user_id'])([TimeUUID(userID)]));

		return dbResults
			.map(dbResult => dbResult.permission)
			.filter(Permissions.isPermission);
	}

	const addPermissionsForUser = async (userID: string, permissions: Permission[]) => {
		const currentPermissions = await getPermissionsForUser(userID);
		const permissionsToAdd = permissions.filter(permission => !currentPermissions.includes(permission));
		const insertQueries = permissionsToAdd.map(permission =>
			PermissionsByUserTable.insert(['user_id', 'permission'])([TimeUUID(userID), permission]));

		await database.query(PermissionsByUserTable.batch(insertQueries));
	}

	return {
		getPermissionsForUser,
		addPermissionsForUser,
	}
}