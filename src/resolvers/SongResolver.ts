import { Song } from '../models/SongModel';
import { Resolver, FieldResolver, Root, ResolverInterface } from "type-graphql";
import { Inject } from 'typedi';
import { File } from '../models/FileModel';
import { FileService } from '../file-service/FileService';
import moment = require('moment');

@Resolver(of => Song)
export class SongResolver implements ResolverInterface<Song>{
	constructor(
		@Inject('FILE_SERVICE') private readonly fileService: FileService
	) { }

	@FieldResolver()
	public file(@Root() song: Song): File {
		return song.file;
	}

	@FieldResolver()
	public accessUrl(@Root() song: Song): Promise<string> {
		if (song.file) {
			return this.fileService.getLinkToFile({
				filenameRemote: song.file.blob,
				expireDate: moment().add(10 * 60, 'minutes') // TODO take song duration + buffer time
			})
		} else {
			throw new Error(`Song ${song.id} has no file attached`);
		}
	}
}