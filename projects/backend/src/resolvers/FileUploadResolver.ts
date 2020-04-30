import { FileUpload } from "../models/FileSourceModels"
import { IServices } from "../services/services"
import { Authorized, FieldResolver, Root, Resolver } from "type-graphql"
import moment from "moment"
import { IConfig } from "../types/config"

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
}
