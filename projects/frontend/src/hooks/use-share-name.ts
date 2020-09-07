import { useMemo } from "react"
import { useShares } from "@musicshare/react-graphql-client"
import { useLibraryID } from "./data/useLibraryID"

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
