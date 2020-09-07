import { useIDStore } from "../../stores/idStore"
import { useCallback } from "react"

export const useLibraryID = () => {
	const libraryID = useIDStore(useCallback((state) => state.libraryID, []))

	return libraryID
}
