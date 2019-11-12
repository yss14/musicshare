import { useRef, useEffect } from "react"

export const usePrevValue = <T extends any>(value: T) => {
	const valueRef = useRef<T>()

	useEffect(() => {
		valueRef.current = value
	}, [value])

	return value.ref
}