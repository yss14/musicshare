import React from "react"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { useMergedSongs, useDirtyMergedViewSongs } from "@musicshare/graphql-client"

export const MergedSongs: React.FC = () => {
	const { isLoading, error, data: songs } = useMergedSongs()
	useDirtyMergedViewSongs()

	if (isLoading || !songs) {
		return <LoadingSpinner />
	}
	if (error) return <div>`Error!: ${error}`</div>

	return <MainSongsView title="All songs" songs={songs} isMergedView />
}
