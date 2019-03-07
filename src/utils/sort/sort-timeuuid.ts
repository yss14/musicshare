import { TimeUUID } from "../../types/TimeUUID";

export const sortByTimeUUIDAsc = (lhs: TimeUUID | string, rhs: TimeUUID | string) => {
	const timeUUIDLhs = typeof lhs === 'string' ? TimeUUID.fromString(lhs) : lhs;
	const timeUUIDRhs = typeof rhs === 'string' ? TimeUUID.fromString(rhs) : rhs;

	return timeUUIDLhs.getDate().getTime() - timeUUIDRhs.getDate().getTime();
}