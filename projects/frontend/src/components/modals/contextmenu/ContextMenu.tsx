import React, { useState, useEffect, useRef, useCallback } from "react"
import styled from "styled-components"
import { Menu } from "antd"

export const ContextMenu = styled.div`
	background-color: white;
	position: fixed;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	border-color: #d6d6d6;
	border-width: 1px;
	border-style: solid;
	display: none;
	min-width: 200px;
	z-index: 100;
`

export const ContextMenuItem = styled(Menu.Item)`
	&:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
`

export const useContextMenu = () => {
	const ref = useRef<HTMLDivElement>(null)
	const [isVisible, setVisible] = useState(false)
	const [{ posX, posY }, setPosition] = useState({ posX: 0, posY: 0 })

	const toggleContextMenu = () => setVisible((state) => !state)
	const hideContextMenu = () => setVisible(false)
	const showContextMenu = useCallback(
		(event?: React.MouseEvent) => {
			setVisible(true)

			if (event) {
				event.preventDefault()

				const posX = event.clientX
				const posY = event.clientY

				setPosition({ posX, posY })
			}

			return false
		},
		[setPosition, setVisible],
	)

	const contextMenuElement = ref.current

	useEffect(() => {
		if (!contextMenuElement) return

		if (isVisible) {
			contextMenuElement.style.display = "block"
			contextMenuElement.style.visibility = "hidden"
			contextMenuElement.style.left = posX + "px"

			// otherwise height is 0 because div not rendered by browser
			setTimeout(() => {
				const height = contextMenuElement.clientHeight
				const windowHeight = window.innerHeight

				if (posY + height < windowHeight) {
					contextMenuElement.style.top = posY + "px"
				} else {
					contextMenuElement.style.top = posY - height + "px"
				}

				contextMenuElement.style.visibility = "visible"
			}, 10)

			document.addEventListener("click", hideContextMenu)

			return () => document.removeEventListener("click", hideContextMenu)
		} else {
			contextMenuElement.style.display = "none"
		}

		return () => undefined
	}, [ref, isVisible, posX, posY, contextMenuElement])

	return { toggleContextMenu, hideContextMenu, showContextMenu, isVisible, ref }
}
