import { FileUpload } from "../models/FileSourceModels"
import { IServices } from "../services/services"
import { Authorized, FieldResolver, Root, Resolver, Mutation, Arg } from "type-graphql"
import moment from "moment"
import { IConfig } from "../types/config"
import { PermissionAuth } from "../auth/middleware/permission-auth"
import { Permissions } from "@musicshare/shared-types"
import * as crypto from "crypto"
import { v4 as uuid } from "uuid"
import { ValidationError } from "apollo-server-core"

@Resolver(() => FileUpload)
export class FileUploadResolver {
	constructor(private readonly services: IServices, private readonly config: IConfig) {}

	@Authorized()
	@FieldResolver(() => String)
	public accessUrl(@Root() fileUpload: FileUpload): Promise<string> {
		return this.services.songFileService.getLinkToFile({
			filenameRemote: fileUpload.blob,
			expireDate: moment().add(this.config.fileStorage.accessTokenExpiry, "minutes"),
		})
	}

	@Authorized()
	@PermissionAuth([Permissions.SONG_UPLOAD])
	@Mutation(() => String)
	public async generateUploadableUrl(@Arg("fileExtension") fileExtension: string): Promise<string> {
		let finalFileExtension = fileExtension.trim()

		if (finalFileExtension.length === 0) {
			throw new ValidationError("file extension cannot be empty")
		}

		if (!finalFileExtension.startsWith(".")) {
			finalFileExtension = "." + finalFileExtension
		}

		const blobName = crypto.createHash("sha256").update(uuid()).digest("hex") + finalFileExtension

		return this.services.songFileService.getLinkToFile({
			filenameRemote: blobName,
			expireDate: moment().add(2, "hours"),
			permission: "write",
		})
	}
}
