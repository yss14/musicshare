import { Resolver, ResolverInterface } from "type-graphql"
import { PlaylistSong } from "../models/PlaylistSongModel"

// this resolver only exists to enable graphql schema generation of PlaylistSong

@Resolver(() => PlaylistSong)
export class PlaylistsongResolver implements ResolverInterface<PlaylistSong> {}
