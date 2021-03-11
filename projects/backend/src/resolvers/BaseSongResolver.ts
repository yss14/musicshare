import { Resolver, ResolverInterface } from "type-graphql"
import { BaseSong } from "../models/SongModel"

// this resolver only exists to enable graphql schema generation of BaseSong

@Resolver(() => BaseSong)
export class BaseSongResolver implements ResolverInterface<BaseSong> {}
