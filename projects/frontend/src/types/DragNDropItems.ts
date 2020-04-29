import { IScopedSong } from "../graphql/types"

export enum DragNDropItem {
	Song = "song",
	SongQueueItem = "SongQueueItem",
}

export interface ISongDNDItem {
	type: DragNDropItem.Song | DragNDropItem.SongQueueItem
	song: IScopedSong
	idx: number
}
