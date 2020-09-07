import { ShareSong } from "@musicshare/shared-types"

export enum DragNDropItem {
	Song = "song",
	SongQueueItem = "SongQueueItem",
}

export interface ISongDNDItem {
	type: DragNDropItem.Song | DragNDropItem.SongQueueItem
	song: ShareSong
	idx: number
}
