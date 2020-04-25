import express from "express";
import * as BodyParser from "body-parser";

interface IMakeExpressAppOpts {
	routers?: express.Router[];
	middleware?: express.RequestHandler[];
}

export const makeExpressApp = ({
	routers,
	middleware,
}: IMakeExpressAppOpts) => {
	const expressApp = express();

	expressApp.use(BodyParser.urlencoded({ extended: true }));

	if (middleware) {
		expressApp.use(...middleware);
	}

	if (routers) {
		expressApp.use(routers);
	}

	return expressApp;
};
