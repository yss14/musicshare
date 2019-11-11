import { useState, useRef } from "react"

export const useDeferedFlag = (delay: number) => {
	const timeoutRef = useRef<number | null>(null)
	const [value, setValue] = useState(false)

	const toggle = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = setTimeout(() => setValue(true), delay)
	}

	const reset = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		setValue(false)
	}

	return [value, toggle, reset] as [boolean, () => void, () => void]
}
