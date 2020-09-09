import { ShareSong } from "../models/SongModel"
import { Resolver, FieldResolver, Root, ResolverInterface, Mutation, Arg, Authorized, Ctx } from "type-graphql"
import { FileSource } from "../models/FileSourceModels"
import { SongUpdateInput } from "../inputs/SongInput"
import { SongAuth } from "../auth/middleware/song-auth"
import { IServices } from "../services/services"
import { RemoveSongFromLibraryInput } from "../inputs/RemoveSongFromLibraryInput"
import { ShareAuth } from "../auth/middleware/share-auth"
import { Permissions } from "@musicshare/shared-types"
import { IncrementSongPlayCountInput } from "../inputs/IncreaseSongPlaycountInput"
import { SongPlay } from "../models/SongPlayModel"
import { IGraphQLContext } from "../types/context"
import { PermissionAuth } from "../auth/middleware/permission-auth"
import { SubmitSongFromRemoteFileInput } from "../inputs/SubmitSongFromRemoteFileInput"
import path from "path"
import { ISongProcessingQueuePayload } from "../job-queues/SongUploadProcessingQueue"
import { ValidationError } from "apollo-server-core"
import { extractBlobNameFromUrl } from "../file-service/file-service-utils"

@Resolver(() => ShareSong)
export class SongResolver implements ResolverInterface<ShareSong> {
	constructor(private readonly services: IServices) {}

	@Authorized()
	@FieldResolver(() => [FileSource])
	public sources(@Root() song: ShareSong): FileSource[] {
		return song.sources
	}

	@Authorized()
	@SongAuth([Permissions.SONG_MODIFY])
	@Mutation(() => ShareSong, { nullable: true })
	public async updateSong(
		@Arg("songID") songID: string,
		@Arg("shareID") shareID: string,
		@Arg("song") song: SongUpdateInput,
	): Promise<ShareSong | null> {
		const { songService } = this.services

		if (song.isValid()) {
			try {
				await songService.update(shareID, songID, song)

				return songService.getByID(shareID, songID)
			} catch (err) /* istanbul ignore next */ {
				console.error(err)

				return null
			}
		}

		// istanbul ignore next
		throw new Error("Song input is not valid")
	}

	@Authorized()
	@SongAuth([Permissions.SONG_MODIFY])
	@ShareAuth([Permissions.SHARE_OWNER])
	@Mutation(() => Boolean, {
		description:
			"Removes a song from a library. If the song is referenced by entities from other shares, " +
			"the song is copied to a linked library an referenced from there.",
	})
	public async removeSongFromLibrary(
		@Arg("input") { shareID, songID }: RemoveSongFromLibraryInput,
	): Promise<boolean> {
		await this.services.songService.removeSongFromLibrary(shareID, songID)

		return true
	}

	@Authorized()
	@SongAuth()
	@Mutation(() => SongPlay)
	public async incrementSongPlayCount(
		@Arg("input") { songID, shareID }: IncrementSongPlayCountInput,
		@Ctx() { userID }: IGraphQLContext,
	): Promise<SongPlay> {
		await this.services.songService.increasePlayCount(shareID, songID, userID!)

		const user = await this.services.userService.getUserByID(userID!)
		const song = await this.services.songService.getByID(shareID, songID)

		return { user, song, dateAdded: new Date() }
	}

	@Authorized()
	@PermissionAuth([Permissions.SONG_UPLOAD])
	@Mutation(() => ShareSong)
	public async submitSongFromRemoteFile(
		@Arg("input") { filename, playlistIDs, remoteFileUrl }: SubmitSongFromRemoteFileInput,
		@Ctx() { userID, library }: IGraphQLContext,
	): Promise<ShareSong> {
		if (!filename.match(/^[^\\\/]*\.(\w+)$/)) {
			throw new ValidationError("<filename> is not valid")
		}

		const fileExtension = path.extname(filename).split(".").join("")
		const blob = extractBlobNameFromUrl(remoteFileUrl)

		const jobQueuePayload: ISongProcessingQueuePayload = {
			file: {
				originalFilename: filename,
				container: this.services.songFileService.container,
				fileExtension,
				blob,
			},
			userID: userID!,
			shareID: library!.id,
			playlistIDs,
		}

		const songID = await this.services.songProcessingQueue.enqueueUpload(jobQueuePayload)

		return this.services.songService.getByID(library!.id, songID)
	}
}
