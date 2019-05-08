import { v4 as uuid } from 'uuid';
import { __TEST__ } from '../utils/env/env-constants';

// istanbul ignore next
export class InternalServerError extends Error {
	constructor(err: unknown) {
		const tracingID = uuid();

		super(`An internal server error occured (tracingID: ${tracingID})`);

		if (!__TEST__) {
			// istanbul ignore next
			console.error(`[${tracingID}]`, err);
		}
	}
}