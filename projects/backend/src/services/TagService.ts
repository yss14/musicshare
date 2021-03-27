import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { TagDBResult } from "../database/tables"

const selectAllAccessibleTagsOfUserQuery = (database: IDatabaseClient, userID: string) =>
	database.query(
		SQL.raw<TagDBResult>(
			`
				SELECT DISTINCT unnest(s.tags) as name
				FROM user_songs_view s
				WHERE s.user_id_ref = $1
				ORDER BY name;
	`,
			[userID],
		),
	)

export type ITagService = ReturnType<typeof TagService>

interface ITagServiceArgs {
	database: IDatabaseClient
}

export const TagService = ({ database }: ITagServiceArgs) => {
	const getAggregatedTagsForUser = async (userID: string): Promise<string[]> => {
		const tagsResults = await selectAllAccessibleTagsOfUserQuery(database, userID)

		return tagsResults.map((result) => result.name)
	}

	return { getAggregatedTagsForUser }
}
