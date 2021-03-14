import { IShareService } from "./ShareService"
import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { TagDBResult } from "../database/tables"

const selectTagsOfSharesQuery = (database: IDatabaseClient, shareIDs: string[]) =>
	database.query(
		SQL.raw<TagDBResult>(
			`
				SELECT DISTINCT unnest(s.tags) as name
				FROM songs s
				INNER JOIN share_songs ss ON ss.song_id_ref = s.song_id
				INNER JOIN share_songs sls ON sls.song_id_ref = ss.song_id_ref
				INNER JOIN shares l ON l.share_id = sls.share_id_ref
				WHERE ss.share_id_ref = ANY($1)
					AND s.date_removed IS NULL
					AND ss.date_removed IS NULL
				ORDER BY name;
	`,
			[shareIDs],
		),
	)

export type ITagService = ReturnType<typeof TagService>

interface ITagServiceArgs {
	database: IDatabaseClient
	shareService: IShareService
}

export const TagService = ({ database, shareService }: ITagServiceArgs) => {
	const getTagsForShare = async (shareID: string): Promise<string[]> => {
		const tagsResults = await selectTagsOfSharesQuery(database, [shareID])

		return tagsResults.map((result) => result.name)
	}

	const getTagsForShares = async (shareIDs: string[]): Promise<string[]> => {
		const tagsResults = await selectTagsOfSharesQuery(database, shareIDs)

		return tagsResults.map((result) => result.name)
	}

	const getAggregatedTagsForUser = async (userID: string): Promise<string[]> => {
		const linkedLibraries = await shareService.getLinkedLibrariesOfUser(userID)

		const tagsResults = await selectTagsOfSharesQuery(
			database,
			linkedLibraries.map((library) => library.id),
		)

		return tagsResults.map((result) => result.name)
	}

	return { getTagsForShare, getTagsForShares, getAggregatedTagsForUser }
}
