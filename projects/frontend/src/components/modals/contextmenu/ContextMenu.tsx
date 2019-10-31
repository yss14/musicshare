import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

export const ContextMenu = styled.div`
	background-color: red;
	position: fixed;
	box-shadow: 0 2px 4px rgba(0,0,0,0.2);
	border-color: #d6d6d6;
    border-width: 1px;
    border-style: solid;
	display: none;
`

export const useContextMenu = (ref: React.RefObject<HTMLDivElement>) => {
	const [isVisible, setVisible] = useState(false)
	const [{ posX, posY }, setPosition] = useState({ posX: 0, posY: 0 })

	const toggleContextMenu = () => setVisible(state => !state)
	const hideContextMenu = () => setVisible(false)
	const showContextMenu = (event?: React.MouseEvent) => {
		setVisible(true)

		if (event) {
			event.preventDefault()

			const posX = event.clientX
			const posY = event.clientY

			setPosition({ posX, posY })
		}

		return false
	}

	const contextMenuElement = ref.current

	useEffect(() => {
		if (!contextMenuElement) return

		if (isVisible) {
			contextMenuElement.style.display = 'block'
			contextMenuElement.style.left = posX + 'px'
			contextMenuElement.style.top = posY + 'px'

			document.addEventListener('click', hideContextMenu)

			return () => document.removeEventListener('click', hideContextMenu)
		} else {
			contextMenuElement.style.display = 'none'
		}

		return () => undefined
	}, [ref, isVisible, posX, posY, contextMenuElement])

	return { toggleContextMenu, hideContextMenu, showContextMenu, isVisible }
}
