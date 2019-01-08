import { BlobService } from './../server/file-uploader';
import { Song } from './../models/song.model';
import { Resolver, Query, Arg, FieldResolver, Root, ResolverInterface } from "type-graphql";
import { Share } from "../models/share.model";
import { plainToClass } from "class-transformer";
import { Inject } from 'typedi';
import { File } from '../models/file.model';

@Resolver(of => Song)
export class SongResolver implements ResolverInterface<Song>{
	constructor(
		@Inject('FILE_UPLOAD') private readonly blobService: BlobService
	) { }

	@FieldResolver()
	public file(@Root() song: Song): File {
		return song.file;
	}

	@FieldResolver()
	public accessUrl(@Root() song: Song): string {
		console.log('accessUrl resolver');
		if (song.file) {
			return this.blobService.getSharedAccessSignatur(song.file.container, song.file.blob, 10 * 60); // TODO take song duration + buffer time
		} else {
			throw new Error(`Song ${song.id} has no file attached`);
		}
	}
}