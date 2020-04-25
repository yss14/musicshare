import { useState, useEffect, useRef, useCallback } from "react"

export function useResettingState<T>(initialValue: T, lifetime: number) {
	const initialValueRef = useRef<T>(initialValue)
	const [value, setNewValue] = useState<T>(initialValue)
	const timeoutRef = useRef<number | null>(null)

	const startTimeout = useCallback(() => {
		timeoutRef.current = window.setTimeout(() => setNewValue(initialValueRef.current), lifetime)
	}, [lifetime])

	const setValue = (newValue: T) => {
		setNewValue(newValue)

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		startTimeout()
	}

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	return [value, setValue] as [T, (newValue: T) => void]
}
