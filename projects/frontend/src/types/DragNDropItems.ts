import { ShareSong } from "@musicshare/shared-types"

export enum DragNDropItem {
	Song = "song",
	SongQueueItem = "SongQueueItem",
}

export interface ISongDNDItem {
	song: ShareSong
	idx: number
}
