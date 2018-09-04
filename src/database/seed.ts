import { Random } from './../utils/random-generator';
import { NodeEnv } from "../types/common-types";
import { Database, IBatchQuery } from "./database";
import * as faker from 'faker';
import { types as CTypes } from 'cassandra-driver';

import { IUserDBResult, IShareByUserDBResult, ISongByShareDBResult } from './schema/initial-schema';
import { filter } from 'minimatch';

const generatedEMails = (numbersOfEMails: number): string[] => {
	return new Array<string>(numbersOfEMails)
		.fill(undefined)
		.map(() => faker.internet.email());
}

type Users = 'user1';
type Shares = 'library_user1';
type Songs = 'song1_library_user1' | 'song2_library_user1';

// https://github.com/Microsoft/TypeScript/issues/15012
type NHKeys<T> = ({ [P in keyof T]: P } & { [x: string]: never })[keyof T];
type Required<T> = {
	[K in NHKeys<T>]: T[K];
};

interface ITestDataSchema {
	users: { [P in Users]: Required<IUserDBResult>; };
	shares: { [P in Shares]: Required<IShareByUserDBResult> };
	songs: { [P in Songs]: Required<ISongByShareDBResult> };
}

export const testData: ITestDataSchema = {
	users: {
		user1: {
			name: 'Yss',
			emails: generatedEMails(2), // cassandra driver takes arrays as sets
			id: CTypes.TimeUuid.fromString('f0d8e1f0-aeb1-11e8-a117-43673ffd376b')
		}
	},
	shares: {
		library_user1: {
			id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'My Share',
			user_id: CTypes.TimeUuid.fromString('f0d8e1f0-aeb1-11e8-a117-43673ffd376b'),
			is_library: true
		}
	},
	songs: {
		song1_library_user1: {
			id: CTypes.TimeUuid.fromString('f0d78260-aeb1-11e8-a117-43673ffd376b'),
			title: 'Zero',
			suffix: null,
			year: 2018,
			bpm: null,
			date_last_edit: Date.now(),
			release_date: new Date(),
			is_rip: false,
			artists: ['Oliver Smith', 'Natalie Holmes'],
			remixer: [],
			featurings: [],
			type: null,
			genres: ['Trance'],
			label: null,
			share_id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b')
		},
		song2_library_user1: {
			id: CTypes.TimeUuid.fromString('f0d69800-aeb1-11e8-a117-43673ffd376b'),
			title: 'Perth',
			suffix: null,
			year: 2018,
			bpm: null,
			date_last_edit: Date.now(),
			release_date: new Date(),
			is_rip: false,
			artists: ['Kink'],
			remixer: ['Dusky'],
			featurings: [],
			type: 'Deep House',
			genres: null,
			label: 'Anjunadeep',
			share_id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b')
		}
	}
}

export const seedDatabase = async (database: Database, env: NodeEnv): Promise<void> => {
	// insert users for development and testing
	if (env !== NodeEnv.Production) {
		await database.execute(`
			INSERT INTO users (id, name, emails) VALUES (?, ?, ?)`,
			[testData.users.user1.id, testData.users.user1.name, testData.users.user1.emails]
		);
	}

	// insert shares for development and testing
	if (env !== NodeEnv.Production) {
		await database.execute(`
			INSERT INTO shares_by_user (id, name, user_id) VALUES (?, ?, ?)`,
			[testData.shares.library_user1.id, testData.shares.library_user1.name, testData.shares.library_user1.user_id]
		);
	}

	// insert songs for development and testing
	if (env !== NodeEnv.Production) {
		for (const [key, s] of Object.entries(testData.songs)) {
			await database.execute(`
				INSERT INTO songs_by_share 
				(id, title, suffix, year, bpm, date_last_edit, release_date, is_rip, artists, remixer, featurings, share_id)
				VALUES
				(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
			`, [s.id, s.title, s.suffix, s.year, s.bpm, s.date_last_edit, s.release_date, s.is_rip, s.artists, s.remixer,
				s.featurings, s.share_id], { prepare: true });
		}

		const songInserts = new Array<IBatchQuery>(10000)
			.fill(undefined)
			.map(() => ({
				query: `
					INSERT INTO songs_by_share 
					(id, title, suffix, year, bpm, date_last_edit, release_date, is_rip, artists, remixer, featurings, share_id)
					VALUES
					(NOW(), ?, ?, ?, ?, toTimestamp(NOW()), ?, ?, ?, ?, ?, ?);
				`,
				params: [faker.name.findName(), null, 2018, 128, null, false, [faker.name.findName(), faker.name.findName()], [faker.name.findName()], [faker.name.findName()], testData.shares.library_user1.id]
			}));
		await database.batch(songInserts, { prepare: true });

	}
}