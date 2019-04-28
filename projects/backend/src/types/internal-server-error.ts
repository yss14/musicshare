import { v4 as uuid } from 'uuid';

// istanbul ignore next
export class InternalServerError extends Error {
	constructor(err: unknown) {
		const tracingID = uuid();

		super(`An internal server error occured (tracingID: ${tracingID})`);

		console.error(`[${tracingID}]`, err);
	}
}