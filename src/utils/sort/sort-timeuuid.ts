import { types as CTypes } from 'cassandra-driver';

export const sortByTimeUUIDAsc = (lhs: CTypes.TimeUuid | string, rhs: CTypes.TimeUuid | string) => {
	const timeUUIDLhs = typeof lhs === 'string' ? CTypes.TimeUuid.fromString(lhs) : lhs;
	const timeUUIDRhs = typeof rhs === 'string' ? CTypes.TimeUuid.fromString(rhs) : rhs;

	return timeUUIDLhs.getDate().getTime() - timeUUIDRhs.getDate().getTime();
}