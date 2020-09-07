import { useIDStore } from "../../stores/idStore"
import { useCallback } from "react"

export const usePlaylistID = () => {
	const playlistID = useIDStore(useCallback((state) => state.playlistID, []))

	return playlistID
}
