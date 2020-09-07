import { useIDStore } from "../../stores/idStore"
import { useCallback } from "react"

export const useUpdatePlaylistID = () => {
	const updatePlaylistID = useIDStore(useCallback((state) => state.setplaylistID, []))

	return updatePlaylistID
}
