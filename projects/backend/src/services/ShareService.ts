import { Permission, Permissions } from '@musicshare/shared-types';
import { Share } from '../models/ShareModel';
import { IDatabaseClient, SQL } from 'postgres-schema-builder';
import { Tables, SharesTable, UserSharesTable } from '../database/tables';
import { v4 as uuid } from 'uuid';
import { ForbiddenError } from 'apollo-server-core';

export class ShareNotFoundError extends ForbiddenError {
	constructor(shareID: string) {
		super(`Share with id ${shareID} not found`);
	}
}

export type IShareService = ReturnType<typeof ShareService>

export const ShareService = (database: IDatabaseClient) => {
	const getSharesOfUser = async (userID: string): Promise<Share[]> => {
		const userSharesQuery = SQL.raw<typeof Tables.shares>(`
			SELECT s.* 
			FROM ${SharesTable.name} s
			INNER JOIN ${UserSharesTable.name} us ON us.share_id_ref = s.share_id
			WHERE us.user_id_ref = $1 AND s.date_removed IS NULL
			ORDER BY s.date_added;
		`, [userID]);

		const dbResults = await database.query(userSharesQuery);

		return dbResults.map(Share.fromDBResult);
	}

	const getShareByID = async (shareID: string, userID: string): Promise<Share> => {
		const dbResults = await database.query(SQL.raw<typeof Tables.shares>(`
			SELECT s.* FROM ${SharesTable.name} s
			INNER JOIN ${UserSharesTable.name} us ON us.share_id_ref = s.share_id
			WHERE s.share_id = $1 AND us.user_id_ref = $2 AND s.date_removed IS NULL;
		`, [shareID, userID]));

		if (!dbResults || dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		}

		return Share.fromDBResult(dbResults[0]);
	}

	const getLinkedLibrariesOfUser = async (userID: string): Promise<Share[]> => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(`
				WITH usershares as (
					SELECT DISTINCT user_shares.share_id_ref as share_id
					FROM user_shares, shares
					WHERE user_shares.user_id_ref = $1
						AND user_shares.share_id_ref = shares.share_id
						AND shares.date_removed IS NULL
				),
				relatedlibraries as (
					SELECT DISTINCT libraries.*
					FROM shares as libraries, user_shares us1, user_shares us2, usershares
					WHERE usershares.share_id = us1.share_id_ref
						AND us1.user_id_ref = us2.user_id_ref
						AND us2.share_id_ref = libraries.share_id
						AND libraries.date_removed IS NULL
						AND libraries.is_library = true
				)
				SELECT * FROM relatedlibraries;
			`, [userID])
		)

		return dbResults.map(Share.fromDBResult)
	}

	const getLinkedLibrariesOfShare = async (shareID: string): Promise<Share[]> => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(`
				SELECT l.*
				FROM shares s
				INNER JOIN user_shares us1 ON us1.share_id_ref = s.share_id
				INNER JOIN user_shares us2 ON us1.user_id_ref = us2.user_id_ref
				INNER JOIN shares l ON l.share_id = us2.share_id_ref
				WHERE s.date_removed IS NULL
					AND l.date_removed IS NULL
					AND l.is_library = true
					AND s.share_id = $1;
			`, [shareID])
		)

		return dbResults.map(Share.fromDBResult)
	}

	const getLinkedShares = async (libraryID: string) => {
		const dbResults = await database.query(
			SQL.raw<typeof Tables.shares>(`
				SELECT s.*
				FROM shares s
				INNER JOIN user_shares us1 ON us1.share_id_ref = s.share_id
				INNER JOIN user_shares us2 ON us1.user_id_ref = us2.user_id_ref
				INNER JOIN shares l ON l.share_id = us2.share_id_ref
				WHERE s.date_removed IS NULL
					AND l.date_removed IS NULL
					AND s.is_library = false
					AND l.share_id = $1;
			`, [libraryID])
		)

		return dbResults.map(Share.fromDBResult)
	}

	const create = async (ownerUserID: string, name: string, isLib: boolean, shareID?: string): Promise<Share> => {
		const id = shareID || uuid();
		const date = new Date();

		await database.query(
			SharesTable.insertFromObj({ share_id: id, name, date_added: date, is_library: isLib, date_removed: null })
		);
		await addUserToShare(id, ownerUserID, Permissions.ALL);

		return Share.fromDBResult({ share_id: id, name: name, is_library: true, date_added: date, date_removed: null });
	}

	const addUser = async (shareID: string, userID: string, permissions: Permission[]): Promise<void> => {
		return addUserToShare(shareID, userID, permissions);
	}

	const addUserToShare = async (shareID: string, userID: string, permissions: string[]) => {
		await database.query(
			UserSharesTable.insertFromObj({
				user_id_ref: userID,
				share_id_ref: shareID,
				permissions,
				date_added: new Date(),
				date_removed: null,
			})
		);
	}

	const removeUser = async (shareID: string, userID: string): Promise<void> => {
		await database.query(
			UserSharesTable.delete(['share_id_ref', 'user_id_ref'])([shareID, userID])
		)
	}

	const rename = async (shareID: string, name: string): Promise<void> => {
		await database.query(
			SharesTable.update(['name'], ['share_id'])([name], [shareID])
		)
	}

	const remove = async (shareID: string): Promise<void> => {
		await database.query(
			SharesTable.update(['date_removed'], ['share_id'])([new Date()], [shareID])
		)
	}

	return {
		getSharesOfUser,
		getShareByID,
		getLinkedLibrariesOfShare,
		getLinkedLibrariesOfUser,
		getLinkedShares,
		create,
		addUser,
		removeUser,
		rename,
		remove,
	}
}