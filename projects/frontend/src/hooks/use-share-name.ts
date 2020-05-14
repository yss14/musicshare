import { useLibraryID } from "../graphql/client/queries/libraryid-query"
import { useMemo } from "react"
import { useShares } from "../graphql/queries/shares-query"

export const useShareName = (shareID: string) => {
	const { loading, data: shares } = useShares()
	const userLibraryID = useLibraryID()

	const sharesMap = useMemo(() => new Map((shares?.viewer.shares || []).map((share) => [share.id, share.name])), [
		shares,
	])

	const displayName = useMemo(() => {
		if (shareID === userLibraryID) return "Library"
		if (sharesMap.has(shareID)) return sharesMap.get(shareID)

		return "Unknown"
	}, [sharesMap, shareID, userLibraryID])

	if (loading) return "Loading..."

	return displayName
}
