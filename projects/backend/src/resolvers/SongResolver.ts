import { ShareSong, Song } from '../models/SongModel';
import { Resolver, FieldResolver, Root, ResolverInterface, Mutation, Arg, Authorized } from "type-graphql";
import { File } from '../models/FileModel';
import moment = require('moment');
import { SongUpdateInput } from '../inputs/SongInput';
import { SongAuth } from '../auth/middleware/song-auth';
import { IServices } from '../services/services';

@Resolver(of => Song)
export class SongResolver implements ResolverInterface<ShareSong>{
	constructor(
		private readonly services: IServices,
	) { }

	@Authorized()
	@FieldResolver()
	public file(@Root() song: ShareSong): File {
		return song.file;
	}

	@Authorized()
	@FieldResolver(() => String)
	public accessUrl(@Root() song: ShareSong): Promise<string> {
		/* istanbul ignore else */
		if (song.file) {
			return this.services.songFileService.getLinkToFile({
				filenameRemote: song.file.blob,
				expireDate: moment().add(10 * 60, 'minutes') // TODO take song duration + buffer time
			})
		} else {
			throw new Error(`Song ${song.id} has no file attached`);
		}
	}

	@Authorized()
	@SongAuth(['song:modify'])
	@Mutation(() => ShareSong, { nullable: true })
	public async updateSong(
		@Arg('songID') songID: string,
		@Arg('shareID') shareID: string,
		@Arg('song') song: SongUpdateInput
	): Promise<ShareSong | null> {
		const { songService, playlistService } = this.services;

		if (song.isValid()) {
			try {
				await songService.update(shareID, songID, song);
				await playlistService.updateSong(shareID, songID, song);

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