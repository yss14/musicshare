import { IScopedSong } from "../graphql/types"

export enum DragNDropItem {
	Song = "song",
}

export interface ISongDNDItem {
	type: DragNDropItem.Song
	song: IScopedSong
	idx: number
}
