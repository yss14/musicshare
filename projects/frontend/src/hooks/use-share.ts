import { ShareIDContext } from "../context/ShareIDContext"
import { useContext } from "react"

export const useShareID = () => {
	const shareID = useContext(ShareIDContext)

	return shareID
}