import { ShareSong, Song } from '../models/SongModel';
import { Resolver, FieldResolver, Root, ResolverInterface, Mutation, Arg, Authorized } from "type-graphql";
import { File } from '../models/FileModel';
import { FileService } from '../file-service/FileService';
import moment = require('moment');
import { SongUpdateInput } from '../inputs/SongInput';
import { ISongService } from '../services/SongService';
import { SongAuth } from '../auth/middleware/song-auth';
import { IPlaylistService } from '../services/PlaylistService';

@Resolver(of => Song)
export class SongResolver implements ResolverInterface<ShareSong>{
	constructor(
		private readonly fileService: FileService,
		private readonly songService: ISongService,
		private readonly playlistService: IPlaylistService,
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
			return this.fileService.getLinkToFile({
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
		if (song.isValid()) {
			await this.songService.update(shareID, songID, song);
			await this.playlistService.updateSong(shareID, songID, song);

			return this.songService.getByID(shareID, songID);
		}

		// istanbul ignore next
		throw new Error('Song input is not valid');
	}
}