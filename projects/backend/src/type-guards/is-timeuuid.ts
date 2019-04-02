import { TimeUUID } from '../types/TimeUUID';

export const isTimeUUID = (value: string) => {
	try {
		TimeUUID(value);

		return true;
	} catch (err) {
		return false;
	}
}