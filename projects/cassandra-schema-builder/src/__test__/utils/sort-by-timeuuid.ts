import { types as CTypes } from 'cassandra-driver';

export const sortByTimeUUIDAsc = (lhs: CTypes.TimeUuid, rhs: CTypes.TimeUuid) =>
	lhs.getDate().getTime() - rhs.getDate().getTime();