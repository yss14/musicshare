import express = require("express");
import * as BodyParser from "body-parser";

interface IMakeExpressAppOpts {
	routers?: express.Router[];
}

export const makeExpressApp = (opts: IMakeExpressAppOpts) => {
	const expressApp = express();

	expressApp.use(BodyParser.urlencoded({ extended: true }));

	if (opts.routers) {
		expressApp.use(opts.routers);
	}

	return expressApp;
}