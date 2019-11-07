import { Song } from '../models/SongModel';
import { Resolver, FieldResolver, Root, ResolverInterface, Mutation, Arg, Authorized } from "type-graphql";
import { FileSource } from '../models/FileSourceModels';
import { SongUpdateInput } from '../inputs/SongInput';
import { SongAuth } from '../auth/middleware/song-auth';
import { IServices } from '../services/services';

@Resolver(of => Song)
export class SongResolver implements ResolverInterface<Song>{
	constructor(
		private readonly services: IServices,
	) { }

	@Authorized()
	@FieldResolver()
	public sources(@Root() song: Song): FileSource[] {
		return song.sources;
	}

	@Authorized()
	@SongAuth(['song:modify'])
	@Mutation(() => Song, { nullable: true })
	public async updateSong(
		@Arg('songID') songID: string,
		@Arg('shareID') shareID: string,
		@Arg('song') song: SongUpdateInput
	): Promise<Song | null> {
		const { songService } = this.services;

		if (song.isValid()) {
			try {
				await songService.update(shareID, songID, song);

				return songService.getByID(shareID, songID);
			} catch (err) /* istanbul ignore next */ {
				console.error(err);

				return null;
			}
		}

		// istanbul ignore next
		throw new Error('Song input is not valid');
	}
}