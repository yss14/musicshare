import express = require("express");
import { isBuffer } from "util";
import { ResponseError, IResponse, ResponseSuccessJSON } from "../../utils/typed-express/responses";
import { HTTPStatusCodes } from "../../types/http-status-codes";
import { Either, right, left } from "../../types/Either";
import { wrapRequestHandler } from "../../utils/typed-express/request-handler";
import { withMiddleware } from "../../utils/typed-express/typed-middleware";
import * as crypto from 'crypto';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { IFileService } from "../../file-service/FileService";
import { Duplex } from "stream";
import * as BodyParser from 'body-parser';
import { commonRestErrors } from "../../utils/typed-express/common-rest-errors";
import { __TEST__ } from "../../utils/env/env-constants";
import { ISongUploadProcessingQueue, ISongProcessingQueuePayload } from "../../job-queues/SongUploadProcessingQueue";
import { isTimeUUID } from "../../type-guards/is-timeuuid";
import { NextHandleFunction } from "connect";
import { CustomRequestHandler } from "../../types/context";

export const fileUploadErrors = {
	bodyNoValidByteBuffer: { identifier: 'body.novalidbytebuffer', message: 'The body is not a valid byte buffer' },
	paramUserIDNotValid: { identifier: 'param.useridnotvalid', message: 'The url param <userID> is not a valid number' },
	paramShareIDNotValid: { identifier: 'param.shareidnotvalid', message: 'The url param <shareID> is not a valid number' },
	headerContentTypeMissing: { identifier: 'header.contenttypemissing', message: 'The header content-type is missing' }
}

interface IRequestWithRawBody extends express.Request {
	rawBody: Buffer;
}

const isRequestWithRawBody = (req: express.Request): req is IRequestWithRawBody => {
	return 'rawBody' in req;
}

const makeRawBodyParser = (fileSizeLimit: number, allowedMimeTypes: string[]) => {
	return BodyParser.raw({
		type: allowedMimeTypes,
		limit: fileSizeLimit,
		verify(req: IRequestWithRawBody, _, buf) {
			req.rawBody = buf;
		}
	});
}

const extractBodyBuffer = async (req: express.Request): Promise<Either<IResponse, Buffer>> => {
	if (isRequestWithRawBody(req) && isBuffer(req.rawBody)) {
		return right(req.rawBody);
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, fileUploadErrors.bodyNoValidByteBuffer));
	}
}

const extractUserID = async (req: express.Request): Promise<Either<IResponse, string>> => {
	const { userID } = req.params;

	if (typeof userID === 'string' && isTimeUUID(userID)) {
		return right(userID);
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, fileUploadErrors.paramUserIDNotValid));
	}
}

const extractShareID = async (req: express.Request): Promise<Either<IResponse, string>> => {
	const { shareID } = req.params;

	if (typeof shareID === 'string' && isTimeUUID(shareID)) {
		return right(shareID);
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, fileUploadErrors.paramShareIDNotValid));
	}
}

const extractContentType = async (req: express.Request): Promise<Either<IResponse, string>> => {
	const contentType = req.get('content-type');

	if (contentType !== undefined) {
		return right(contentType);
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, fileUploadErrors.headerContentTypeMissing));
	}
}

const extractPlaylistIDs = (req: express.Request): string[] => {
	const { playlistID } = req.query;

	if (playlistID === undefined) {
		return [];
	}

	if (typeof playlistID === "string") {
		return [playlistID]
	}

	return playlistID;
}

const requestHandler = (fileService: IFileService, uploadProcessingQueue: ISongUploadProcessingQueue) =>
	// tslint:disable-next-line:max-func-args
	async (req: express.Request, contentType: string, file: Buffer, userID: string, shareID: string): Promise<IResponse> => {
		const originalFilename = decodeURI(path.basename(req.path));
		const fileExtension = path.extname(originalFilename).split('.').join('');
		const remoteFilename = crypto
			.createHash('sha256')
			.update(uuid() + file.length)
			.digest('hex') + '.' + fileExtension;

		const readableStream = new Duplex();
		readableStream.push(file);
		readableStream.push(null);

		try {
			await fileService.uploadFile({
				filenameRemote: remoteFilename,
				contentType: contentType,
				source: readableStream
			});

			const jobQueuePayload: ISongProcessingQueuePayload = {
				file: {
					originalFilename: originalFilename,
					container: fileService.container,
					fileExtension: fileExtension,
					blob: remoteFilename
				},
				userID,
				shareID,
				playlistIDs: extractPlaylistIDs(req)
			}

			await uploadProcessingQueue.enqueueUpload(jobQueuePayload);

			return ResponseSuccessJSON(HTTPStatusCodes.CREATED, {});
		} catch (err) {
			/* istanbul ignore if */
			if (!__TEST__) console.error(err);

			return ResponseError(HTTPStatusCodes.INTERNAL_SERVER_ERROR, commonRestErrors.internalServerError);
		}
	}

const fileUploadRoute = (fileService: IFileService, uploadProcessingQueue: ISongUploadProcessingQueue) => wrapRequestHandler(
	withMiddleware(
		extractContentType,
		extractBodyBuffer,
		extractUserID,
		extractShareID,
	)(requestHandler(fileService, uploadProcessingQueue))
);

interface IFileUploadRouterArgs {
	songFileService: IFileService;
	uploadProcessingQueue: ISongUploadProcessingQueue;
	maxFileSize: number;
	allowedMimeTypes?: string[];
	bodyParser?: NextHandleFunction;
	auth: CustomRequestHandler;
}

export const fileUploadRouter = ({ songFileService, uploadProcessingQueue, maxFileSize, allowedMimeTypes, bodyParser, auth }: IFileUploadRouterArgs) => {
	const finalAllowedMimeTypes = allowedMimeTypes || ['*/*'];
	const restRoute = fileUploadRoute(songFileService, uploadProcessingQueue);

	return express.Router()
		.use(bodyParser || makeRawBodyParser(maxFileSize, finalAllowedMimeTypes))
		.post('/users/:userID/shares/:shareID/files/:filename', auth as any, restRoute);
}
