import React from "react"
import { useShareSongs } from "../../graphql/queries/share-songs-query"
import { IShareRoute } from "../../interfaces"
import { useParams } from "react-router-dom"
import { MainSongsView } from "./MainSongsView"
import { LoadingSpinner } from "../../components/common/LoadingSpinner"
import { useShareDirtySongs } from "../../graphql/queries/share-songs-dirty-query"
import { useLibraryID } from "../../graphql/client/queries/libraryid-query"

export const ShareSongs: React.FC = () => {
	const { shareID } = useParams<IShareRoute>()
	const { loading, error, data: songs } = useShareSongs(shareID)
	useShareDirtySongs(shareID)
	const libraryID = useLibraryID()

	if (loading || !songs) {
		return <LoadingSpinner />
	}
	if (error) return <div>`Error!: ${error}`</div>

	return <MainSongsView title="All songs" songs={songs} isShare={shareID !== libraryID} />
}
