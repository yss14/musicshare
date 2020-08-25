import React from "react"
import { IShareRoute } from "../../interfaces"
import { useParams } from "react-router-dom"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { useShareDirtySongs } from "../../graphql/queries/share-songs-dirty-query"
import { useShareSongs } from "@musicshare/graphql-client"

export const ShareSongs: React.FC = () => {
	const { shareID } = useParams<IShareRoute>()
	const { isLoading, error, data: songs } = useShareSongs(shareID)
	useShareDirtySongs(shareID)

	if (isLoading || !songs) {
		return <LoadingSpinner />
	}
	if (error) return <div>`Error!: ${error}`</div>

	return <MainSongsView title="All songs" songs={songs} isMergedView={false} />
}
