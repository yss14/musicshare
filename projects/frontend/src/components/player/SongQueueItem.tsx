import React, { useRef } from "react"
import { IBaseSongPlayable } from "../../graphql/types"
import { buildSongName } from "../../utils/songname-builder"
import styled from "styled-components"
import { useDrop, DropTargetMonitor, XYCoord, useDrag } from "react-dnd"
import { DragNDropItem, ISongDNDItem } from "../../types/DragNDropItems"

const SongQueueItemContainer = styled.div`
	min-height: 44px;
	box-sizing: border-box;
	padding: 4px;
	border-bottom: 1px solid silver;
	font-size: 16px;

	&:last-child {
		border-bottom: none;
	}
`

const Title = styled.div`
	font-size: 13px;
	font-weight: bold;
`

const SubTitle = styled.div`
	font-size: 11px;
`

interface ISongQueueItemProps {
	song: IBaseSongPlayable
	index: number
	moveItem: (dragIndex: number, hoverIndex: number) => void
}

export const SongQueueItem: React.FC<ISongQueueItemProps> = ({ song, index, moveItem }) => {
	const ref = useRef<HTMLDivElement>(null)
	const [, drop] = useDrop({
		accept: DragNDropItem.SongQueueItem,
		hover(item: ISongDNDItem, monitor: DropTargetMonitor) {
			if (!ref.current) {
				return
			}
			const dragIndex = item.idx
			const hoverIndex = index

			if (dragIndex === hoverIndex) {
				return
			}

			const hoverBoundingRect = ref.current!.getBoundingClientRect()
			const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
			const clientOffset = monitor.getClientOffset()
			const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

			if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return
			}

			if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return
			}

			moveItem(dragIndex, hoverIndex)

			item.idx = hoverIndex
		},
	})

	const [{ isDragging }, drag] = useDrag({
		item: { type: DragNDropItem.SongQueueItem, song, idx: index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	})

	const opacity = isDragging ? 0 : 1

	drag(drop(ref))

	return (
		<SongQueueItemContainer ref={ref} style={{ opacity }}>
			<Title>{buildSongName(song)}</Title>
			<SubTitle>{song.artists.join(", ")}</SubTitle>
		</SongQueueItemContainer>
	)
}
