import { useIDStore } from "../../stores/idStore"
import { useCallback } from "react"

export const useUpdateShareID = () => {
	const updateShareID = useIDStore(useCallback((state) => state.setShareID, []))

	return updateShareID
}
