import React, { useCallback } from "react"
import { OrderedListOutlined } from "@ant-design/icons"
import { Popover, Button, Empty } from "antd"
import { SongQueueItem } from "./SongQueueItem"
import Scrollbars from "react-custom-scrollbars"
import styled from "styled-components"
import { IPlayerQueueItem } from "./player-state"

const TitleContainer = styled.div`
	display: flex;
	align-items: center;
`

const ClearButton = styled.div`
	margin-left: auto;
	color: rgba(0, 0, 0, 0.25);
	cursor: pointer;
	font-size: 12px;
`

interface ISongQueueProps {
	queue: IPlayerQueueItem[]
	setSongQueue: (items: IPlayerQueueItem[]) => void
	clearQueue: () => void
}

export const SongQueue: React.FC<ISongQueueProps> = React.memo(({ queue, setSongQueue, clearQueue }) => {
	const moveItem = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			if (dragIndex === hoverIndex) return

			const newSongQueue = [...queue]

			newSongQueue.splice(hoverIndex, 0, newSongQueue.splice(dragIndex, 1)[0])

			setSongQueue(newSongQueue)
		},
		[queue, setSongQueue],
	)

	const removeItem = useCallback(
		(index: number) => {
			setSongQueue(queue.filter((_, idx) => idx !== index))
		},
		[setSongQueue, queue],
	)

	const content = (
		<Scrollbars autoHide style={{ height: 350, width: 250 }}>
			{queue.map(({ song, id }, idx) => (
				<SongQueueItem song={song} key={id} moveItem={moveItem} onRemove={removeItem} index={idx} />
			))}
			{queue.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Empty Queue" />}
		</Scrollbars>
	)

	const title = (
		<TitleContainer>
			<div>Song Queue</div>
			<ClearButton onClick={clearQueue}>Clear</ClearButton>
		</TitleContainer>
	)

	return (
		<Popover
			placement="top"
			title={title}
			content={content}
			trigger="click"
			overlayClassName="ant-popover-content-nopadding"
		>
			<Button icon={<OrderedListOutlined />} type="link" size="large" style={{ color: "white" }} />
		</Popover>
	)
})
