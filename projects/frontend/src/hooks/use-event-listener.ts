import { useRef, useEffect } from "react"

type EventHandler<K extends keyof HTMLElementEventMap> = (ev: HTMLElementEventMap[K]) => any

export const useEventListener = <K extends keyof HTMLElementEventMap>(
	eventName: K,
	handler: EventHandler<K>,
	element?: HTMLElement | Window,
) => {
	const savedHandler = useRef<EventHandler<K>>(handler)

	useEffect(() => {
		savedHandler.current = handler
	}, [handler])

	const finalElement = element || document

	useEffect(() => {
		const isSupported = element && element.addEventListener
		if (!isSupported) return

		const eventListener = (event: HTMLElementEventMap[K]) => savedHandler.current(event)

		finalElement.addEventListener(eventName, eventListener as any)

		return () => {
			finalElement.removeEventListener(eventName, eventListener as any)
		}
	}, [eventName, element, finalElement])
}
