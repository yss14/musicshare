import { useRef, useEffect } from "react";

type Callback = () => any

export const useInterval = (callback: Callback, delay: number) => {
	const savedCallback = useRef<Callback>(() => undefined)

	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	useEffect(() => {
		const id = setInterval(savedCallback.current, delay)

		return () => clearInterval(id)
	}, [delay])
}
