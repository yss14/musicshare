import { FileUpload } from "../models/FileSourceModels";
import { IServices } from "../services/services";
import { Authorized, FieldResolver, Root, Resolver } from "type-graphql";
import moment = require("moment");

@Resolver(of => FileUpload)
export class FileUploadResolver {
	constructor(
		private readonly services: IServices,
	) { }

	@Authorized()
	@FieldResolver(() => String)
	public accessUrl(
		@Root() fileUpload: FileUpload,
	): Promise<string> {
		return this.services.songFileService.getLinkToFile({
			filenameRemote: fileUpload.blob,
			expireDate: moment().add(30, 'minutes'),
		})
	}
}