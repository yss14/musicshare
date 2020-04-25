import { IScopedSong } from "../../graphql/types"

export type MoveSong = (source: IScopedSong, target: IScopedSong) => void
