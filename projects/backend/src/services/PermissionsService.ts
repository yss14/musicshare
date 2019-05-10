import { Permission, Permissions } from "../auth/permissions";
import { IDatabaseClient } from "cassandra-schema-builder";
import { SharesByUserTable } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";

export interface IPermissionService {
	getPermissionsForUser(shareID: string, userID: string): Promise<Permission[]>;
	addPermissionsForUser(shareID: string, userID: string, permissions: Permission[]): Promise<void>;
	getAvailablePermissions(): Promise<Permission[]>;
}

interface IPermissionServiceArgs {
	database: IDatabaseClient;
}

export const PermissionService = ({ database }: IPermissionServiceArgs): IPermissionService => {
	const getPermissionsForUser = async (shareID: string, userID: string): Promise<Permission[]> => {
		const dbResults = await database.query(
			SharesByUserTable.select(['permissions'], ['user_id', 'id'])([TimeUUID(userID), TimeUUID(shareID)]));

		return dbResults
			.map(dbResult => dbResult.permission)
			.filter(Permissions.isPermission);
	}

	const addPermissionsForUser = async (shareID: string, userID: string, permissions: Permission[]) => {
		const currentPermissions = await getPermissionsForUser(shareID, userID);
		const permissionsToAdd = permissions.filter(permission => !currentPermissions.includes(permission));

		await database.query(
			SharesByUserTable.update(['permissions'], ['user_id', 'id'])
				([permissionsToAdd], [TimeUUID(userID), TimeUUID(shareID)])
		);
	}

	const getAvailablePermissions = async () => {
		return Permissions.ALL;
	}

	return {
		getPermissionsForUser,
		addPermissionsForUser,
		getAvailablePermissions,
	}
}