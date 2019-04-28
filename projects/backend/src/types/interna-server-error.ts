import { v4 as uuid } from 'uuid';

export class InternalServerError extends Error {
	constructor(err: unknown) {
		const tracingID = uuid();

		super(`An internal server errror occured (tracingID: ${tracingID})`);

		console.error(`[${tracingID}]`, err);
	}
}