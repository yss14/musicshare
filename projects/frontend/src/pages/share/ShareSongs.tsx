import React from "react"
import { IShareRoute } from "../../interfaces"
import { useParams } from "react-router-dom"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { useShareSongs, useDirtyShareSongs } from "@musicshare/react-graphql-client"
import { DefaultErrorResult } from "../../components/common/DefaultErrorResult"

export const ShareSongs: React.FC = () => {
	const { shareID } = useParams<IShareRoute>()
	const { isLoading, error, data: songs } = useShareSongs(shareID)
	useDirtyShareSongs(shareID, { enabled: !isLoading && Array.isArray(songs) })

	if (isLoading) {
		return <LoadingSpinner />
	}
	if (error) return <DefaultErrorResult error={error.toString()} />

	return <MainSongsView title="All songs" songs={songs || []} isMergedView={false} />
}
