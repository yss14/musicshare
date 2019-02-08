import express = require("express");
import { isBuffer } from "util";
import { ResponseError, IResponse, ResponseSuccessJSON } from "../../utils/typed-express/responses";
import { HTTPStatusCodes } from "../../types/http-status-codes";
import { Either, right, left } from "../../types/Either";
import { wrapRequestHandler, isExpressRequestCompatible } from "../../utils/typed-express/request-handler";
import { withMiddleware } from "../../utils/typed-express/typed-middleware";
import * as crypto from 'crypto';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { FileService } from "../../file-service/FileService";
import { Duplex } from "stream";
import * as BodyParser from 'body-parser';
import { commonRestErrors } from "../../utils/typed-express/common-rest-errors";
import { __TEST__ } from "../../utils/env/env-constants";

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
		verify(req: IRequestWithRawBody, res, buf, encoding) {
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

const extractUserID = async (req: express.Request): Promise<Either<IResponse, number>> => {
	if (typeof req.params.userID === 'number') {
		return right(req.params.userID);
	} else if (!isNaN(parseInt(req.params.userID))) {
		return right(parseInt(req.params.userID));
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, fileUploadErrors.paramUserIDNotValid));
	}
}

const extractShareID = async (req: express.Request): Promise<Either<IResponse, number>> => {
	if (typeof req.params.shareID === 'number') {
		return right(req.params.shareID);
	} else if (!isNaN(parseInt(req.params.shareID))) {
		return right(parseInt(req.params.shareID));
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

const requestHandler = (fileService: FileService) => async (req: express.Request, file: Buffer, userID: number, shareID: number, contentType: string): Promise<IResponse> => {
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

		// TODO: Inject sond processing queue and schedul job

		return ResponseSuccessJSON(HTTPStatusCodes.CREATED, {});
	} catch (err) {
		if (!__TEST__) console.error(err);

		return ResponseError(HTTPStatusCodes.INTERNAL_SERVER_ERROR, commonRestErrors.internalServerError);
	}
}

const fileUploadRoute = (fileService: FileService) => wrapRequestHandler(
	withMiddleware(
		extractBodyBuffer,
		extractUserID,
		extractShareID,
		extractContentType
	)(requestHandler(fileService))
);

export const fileUploadRouter = (fileService: FileService, maxFileSize: number, allowedMimeTypes?: string[]) => {
	const finalAllowedMimeTypes = allowedMimeTypes || ['*/*'];
	const restRoute = fileUploadRoute(fileService);

	return express.Router()
		.use(makeRawBodyParser(maxFileSize, finalAllowedMimeTypes))
		.post('/users/:userID/shares/:shareID/files', restRoute);
}
