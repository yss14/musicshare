import { useLibraryID } from "../graphql/client/queries/libraryid-query"
import { useMemo } from "react"
import { useShares } from "@musicshare/graphql-client"

export const useShareName = (shareID: string) => {
	const { isLoading, data: shares } = useShares()
	const userLibraryID = useLibraryID()

	const sharesMap = useMemo(() => new Map((shares || []).map((share) => [share.id, share.name])), [shares])

	const displayName = useMemo(() => {
		if (shareID === userLibraryID) return "Library"
		if (sharesMap.has(shareID)) return sharesMap.get(shareID)

		return "Unknown"
	}, [sharesMap, shareID, userLibraryID])

	if (isLoading) return "Loading..."

	return displayName
}
