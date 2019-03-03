import { TimeUUID } from "../types/TimeUUID";
import moment = require("moment");
import { sortByTimeUUIDAsc } from "../utils/sort/sort-timeuuid";

test('sort objects', () => {
	const id1 = TimeUUID.fromDate(moment().subtract(4, 'days').toDate());
	const id2 = TimeUUID.fromDate(moment().subtract(3, 'days').toDate());
	const id3 = TimeUUID.fromDate(moment().subtract(2, 'days').toDate());
	const id4 = TimeUUID.fromDate(moment().subtract(1, 'days').toDate());

	const timeUUIDs = [id1, id3, id2, id4];

	const sortedTimeUUIDs = timeUUIDs.sort(sortByTimeUUIDAsc);

	expect(sortedTimeUUIDs).toEqual([id1, id2, id3, id4]);
});