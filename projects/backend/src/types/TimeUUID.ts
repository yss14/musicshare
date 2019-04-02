import { types as CTypes } from 'cassandra-driver';

//export const TimeUUID = CTypes.TimeUuid;
export type TimeUUID = CTypes.TimeUuid;

export const TimeUUID = (value?: string | Date): TimeUUID => {
	if (value instanceof Date) {
		return CTypes.TimeUuid.fromDate(value);
	} else if (typeof value === 'string') {
		return CTypes.TimeUuid.fromString(value);
	} else {
		return CTypes.TimeUuid.now();
	}
}