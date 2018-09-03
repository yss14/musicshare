import { Song } from './../models/song.model';
import { Resolver, Query, Arg } from "type-graphql";
import { Share } from "../models/share.model";
import { plainToClass } from "class-transformer";
import { ShareService } from '../services/share.service';

@Resolver(Song)
export class SongResolver {
	constructor(
		private readonly _shareService: ShareService
	) { }

	@Query(returns => Song)
	public share(@Arg("id") id: string): Promise<Share | undefined> {
		return Promise.resolve(
			plainToClass(Share, {
				id: '1234',
				name: 'Some share',
				userID: '23728'
			})
		);
	}

	/*@Query(returns => [Share])
	public shares(@Arg(""))*/
}