import { useContext } from "react";
import { APIContext } from "../context/APIContext";

export const useAPIs = () => {
	const apis = useContext(APIContext);

	return apis;
}