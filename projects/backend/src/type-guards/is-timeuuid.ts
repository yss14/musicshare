import { TimeUUID } from '../types/TimeUUID';

export const isTimeUUID = (value: string) => {
	try {
		TimeUUID.fromString(value);

		return true;
	} catch (err) {
		return false;
	}
}