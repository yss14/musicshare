import express = require("express");
import { IResponse } from "./responses";
import { commonRestErrors } from "./common-rest-errors";

export type CustomExpressRequestHandler<T> = (req: T) => Promise<IResponse>;
export type ExpressRequestHandler<T> = (req: T, res: express.Response) => void;

export const isExpressRequestCompatible = (req: any): req is express.Request => {
	return req.app && req.baseUrl && req.body && req.headers && req.method && req.protocol && req.hostname;
}

export const wrapRequestHandler = <T extends express.Request = express.Request>(handler: CustomExpressRequestHandler<T>): ExpressRequestHandler<T> => {
	return (request, response) => {
		handler(request).then(
			handlerResponse => handlerResponse.apply(response),
			error => response.status(500).json({ error: commonRestErrors.internalServerError })
		);
	};
}