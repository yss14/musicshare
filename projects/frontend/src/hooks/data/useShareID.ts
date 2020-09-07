import { useIDStore } from "../../stores/idStore"
import { useCallback } from "react"

export const useShareID = () => {
	const shareID = useIDStore(useCallback((state) => state.shareID, []))

	return shareID
}
