import { Song } from '../models/SongModel';
import { Resolver, FieldResolver, Root, ResolverInterface, Mutation, Arg, Authorized } from "type-graphql";
import { Inject } from 'typedi';
import { File } from '../models/FileModel';
import { FileService } from '../file-service/FileService';
import moment = require('moment');
import { SongInput } from '../inputs/SongInput';
import { ISongService } from '../services/SongService';

@Resolver(of => Song)
export class SongResolver implements ResolverInterface<Song>{
	constructor(
		@Inject('FILE_SERVICE') private readonly fileService: FileService,
		@Inject('SONG_SERVICE') private readonly songService: ISongService,
	) { }

	@Authorized()
	@FieldResolver()
	public file(@Root() song: Song): File {
		return song.file;
	}

	@Authorized()
	@FieldResolver()
	public accessUrl(@Root() song: Song): Promise<string> {
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
	@Mutation(() => Song, { nullable: true })
	public async updateSong(
		@Arg('songID') songID: string,
		@Arg('shareID') shareID: string,
		@Arg('song') song: SongInput
	): Promise<Song | null> {
		if (song.isValid()) {
			await this.songService.update(shareID, songID, song);

			return this.songService.getByID(shareID, songID);
		}

		throw new Error('Song input is not valid');
	}
}