import { IScopedSong } from "../graphql/types";

export enum DragNDropItem {
	Song = 'song'
}

export interface IAcceptSong {
	type: DragNDropItem.Song;
	song: IScopedSong;
}