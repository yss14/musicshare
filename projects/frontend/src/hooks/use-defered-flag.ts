import { useState, useRef, useCallback } from "react"

export const useDeferedFlag = (delay: number) => {
	const timeoutRef = useRef<NodeJS.Timer | null>(null)
	const [value, setValue] = useState(false)

	const toggle = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = setTimeout(() => setValue(true), delay)
	}, [timeoutRef, setValue, delay])

	const reset = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		setValue(false)
	}, [timeoutRef, setValue])

	return [value, toggle, reset] as [boolean, () => void, () => void]
}
