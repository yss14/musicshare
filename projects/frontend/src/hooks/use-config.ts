import { useContext } from "react"
import { ConfigContext } from "../context/configContext"

export const useConfig = () => useContext(ConfigContext)
