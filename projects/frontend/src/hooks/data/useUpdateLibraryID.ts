import { useIDStore } from "../../stores/idStore"
import { useCallback } from "react"

export const useUpdateLibraryID = () => {
	const updateLibraryID = useIDStore(useCallback((state) => state.setLibraryID, []))

	return updateLibraryID
}
