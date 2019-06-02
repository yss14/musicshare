import { Permission, Permissions } from "../auth/permissions";
import { IDatabaseClient } from "postgres-schema-builder";
import { UserSharesTable } from "../database/schema/tables";

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
			UserSharesTable.select(['permissions'], ['user_id_ref', 'share_id_ref'])([userID, shareID]));

		return dbResults[0].permissions
			.filter(Permissions.isPermission);
	}

	const addPermissionsForUser = async (shareID: string, userID: string, permissions: Permission[]) => {
		await database.query(
			UserSharesTable.update(['permissions'], ['user_id_ref', 'share_id_ref'])
				([permissions], [userID, shareID])
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