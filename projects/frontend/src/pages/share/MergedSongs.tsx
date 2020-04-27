import React from "react"
import { useMergedSongs } from "../../graphql/queries/merged-songs-query"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { SongTableColumn } from "../../components/song-table/SongTableColumns"

export const MergedSongs: React.FC = () => {
	const { loading, error, data: songs } = useMergedSongs()

	if (loading || !songs) {
		return <LoadingSpinner />
	}
	if (error) return <div>`Error!: ${error}`</div>

	return (
		<MainSongsView
			title="All songs"
			songs={songs}
			columns={[
				SongTableColumn.Indicator,
				SongTableColumn.Title,
				SongTableColumn.Time,
				SongTableColumn.Artists,
				SongTableColumn.Genres,
			]}
		/>
	)
}
