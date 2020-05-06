import { Permission, Permissions } from "@musicshare/shared-types"
import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { UserSharesTable, Tables } from "../database/tables"

export type IPermissionService = ReturnType<typeof PermissionService>

interface IPermissionServiceArgs {
	database: IDatabaseClient
}

export const PermissionService = ({ database }: IPermissionServiceArgs) => {
	const getPermissionsForUser = async (shareID: string, userID: string): Promise<Permission[]> => {
		const dbResults = await database.query(
			UserSharesTable.select(["permissions"], ["user_id_ref", "share_id_ref"])([userID, shareID]),
		)

		return dbResults[0].permissions.filter(Permissions.isPermission)
	}

	const getPermissionsForUserShares = async (userID: string) => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.user_shares>(
				`
			SELECT * FROM user_shares us
			INNER JOIN shares s ON s.share_id = us.share_id_ref
			WHERE s.date_removed IS NULL AND us.user_id_ref = $1;
		`,
				[userID],
			),
		)

		return dbResults.map((result) => ({
			shareID: result.share_id_ref,
			permissions: result.permissions.filter(Permissions.isPermission),
		}))
	}

	const addPermissionsForUser = async (shareID: string, userID: string, permissions: Permission[]) => {
		await database.query(
			UserSharesTable.update(["permissions"], ["user_id_ref", "share_id_ref"])([permissions], [userID, shareID]),
		)
	}

	const getAvailablePermissions = async () => {
		return Permissions.ALL
	}

	return {
		getPermissionsForUser,
		getPermissionsForUserShares,
		addPermissionsForUser,
		getAvailablePermissions,
	}
}
