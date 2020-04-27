import React from "react"
import { useMergedSongs } from "../../graphql/queries/merged-songs-query"
import { MainSongsView } from "./SongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { SongTableColumn } from "../../components/song-table/song-table-columns"

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
			columns={[SongTableColumn.Title, SongTableColumn.Time, SongTableColumn.Artists, SongTableColumn.Genres]}
		/>
	)
}
