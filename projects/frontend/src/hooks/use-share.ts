import { useParams } from "react-router-dom"
import { IShareRoute } from "../interfaces"

export const useShareID = () => {
	const { shareID } = useParams<IShareRoute>()

	return shareID
}