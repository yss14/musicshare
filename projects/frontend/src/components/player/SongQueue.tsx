import React, { useCallback } from "react"
import { Popover, Button, Empty } from "antd"
import { usePlayer } from "../../player/player-hook"
import { SongQueueItem } from "./SongQueueItem"
import Scrollbars from "react-custom-scrollbars"

export const SongQueue: React.FC = () => {
	const { queue, setSongQueue } = usePlayer()

	const moveItem = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			if (dragIndex === hoverIndex) return

			const newSongQueue = [...queue]

			newSongQueue.splice(hoverIndex, 0, newSongQueue.splice(dragIndex, 1)[0])

			setSongQueue(newSongQueue)
		},
		[queue, setSongQueue],
	)

	const content = (
		<Scrollbars autoHide style={{ height: 350, width: 250 }}>
			{queue.map(({ song, id }, idx) => (
				<SongQueueItem song={song} key={id} moveItem={moveItem} index={idx} />
			))}
			{queue.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Empty Queue" />}
		</Scrollbars>
	)

	return (
		<Popover
			placement="top"
			title="Song Queue"
			content={content}
			trigger="click"
			overlayClassName="ant-popover-content-nopadding"
		>
			<Button icon="ordered-list" type="link" size="large" style={{ color: "white" }} />
		</Popover>
	)
}
