import React from "react"
import { useMergedSongs } from "../../graphql/queries/merged-songs-query"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { useMergedViewDirtySongs } from "../../graphql/queries/share-songs-dirty-query"

export const MergedSongs: React.FC = () => {
	const { loading, error, data: songs } = useMergedSongs()
	useMergedViewDirtySongs()

	if (loading || !songs) {
		return <LoadingSpinner />
	}
	if (error) return <div>`Error!: ${error}`</div>

	return <MainSongsView title="All songs" songs={songs} isMergedView />
}
