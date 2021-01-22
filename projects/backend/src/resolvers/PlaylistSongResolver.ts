import { Resolver, ResolverInterface } from "type-graphql"
import { PlaylistSong } from "../models/PlaylistSongModel"

@Resolver(() => PlaylistSong)
export class PlaylistsongResolver implements ResolverInterface<PlaylistSong> {}
