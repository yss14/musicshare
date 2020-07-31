import { useEffect, useRef } from "react"

export function useUpdatedValueIf<T>(value: T, condition: boolean) {
	const currentValue = useRef(value)

	useEffect(() => {
		if (condition) {
			currentValue.current = value
		}
	}, [value, condition])

	return currentValue.current
}
