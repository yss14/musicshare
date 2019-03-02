import { SongService } from '../services/SongService';
import { DatabaseConnection } from "./DatabaseConnection";
import * as faker from 'faker';
import { types as CTypes } from 'cassandra-driver';
import { IUserDBResult, IShareByUserDBResult, ISongByShareDBResult } from './schema/initial-schema';
import { createPrefilledArray } from '../utils/array/create-prefilled-array';
import { __PROD__, __DEV__ } from '../utils/env/env-constants';
import { makeFileObject } from '../models/interfaces/IFile';
import moment = require('moment');

type Users = 'user1' | 'user2';
type Shares = 'library_user1' | 'library_user2' | 'some_shared_library';
type Songs = 'song1_library_user1' | 'song2_library_user1' | 'song3_library_user1';

interface ITestDataSchema {
	users: { [P in Users]: Required<IUserDBResult>; };
	shares: { [P in Shares]: Required<IShareByUserDBResult> };
	songs: { [P in Songs]: Required<ISongByShareDBResult> };
}

const generatedEMails = (numbersOfEMails: number): string[] => {
	const prefilledArray = createPrefilledArray(numbersOfEMails, '');

	return prefilledArray
		.map(() => faker.internet.email())
		.sort();
}

export const testData: ITestDataSchema = {
	users: {
		user1: {
			name: 'Yss',
			emails: generatedEMails(2), // cassandra driver takes arrays as sets
			id: CTypes.TimeUuid.fromString('f0d8e1f0-aeb1-11e8-a117-43673ffd376b')
		},
		user2: {
			name: 'Simon',
			emails: generatedEMails(2), // cassandra driver takes arrays as sets
			id: CTypes.TimeUuid.fromString('f0d8e1f1-aeb1-11e8-a117-43673ffd376b')
		}
	},
	shares: {
		library_user1: {
			id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Share Yss',
			user_id: CTypes.TimeUuid.fromString('f0d8e1f0-aeb1-11e8-a117-43673ffd376b'),
			is_library: true
		},
		library_user2: {
			id: CTypes.TimeUuid.fromString('f0d659e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Share Simon',
			user_id: CTypes.TimeUuid.fromString('f0d8e1f1-aeb1-11e8-a117-43673ffd376b'),
			is_library: true
		},
		some_shared_library: {
			id: CTypes.TimeUuid.fromString('f0d359e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Some Shared Library',
			user_id: CTypes.TimeUuid.fromString('f0d8e1f0-aeb1-11e8-a117-43673ffd376b'),
			is_library: false
		}
	},
	songs: {
		song1_library_user1: {
			id: CTypes.TimeUuid.fromDate(moment().subtract(3, 'hour').toDate()),
			title: 'Zero',
			suffix: null,
			year: 2018,
			bpm: null,
			date_last_edit: new Date(),
			release_date: CTypes.LocalDate.fromDate(new Date('2018-03-11')),
			is_rip: false,
			artists: ['Oliver Smith'],
			remixer: [],
			featurings: ['Natalie Holmes'],
			type: null,
			genres: ['Trance'],
			label: null,
			share_id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			requires_user_action: false,
			file: JSON.stringify(makeFileObject('songs', 'zero', 'zero_somesuffic', 'mp3'))
		},
		song2_library_user1: {
			id: CTypes.TimeUuid.fromDate(moment().subtract(2, 'hour').toDate()),
			title: 'Perth',
			suffix: null,
			year: 2018,
			bpm: null,
			date_last_edit: new Date(),
			release_date: CTypes.LocalDate.fromDate(new Date('2019-01-02')),
			is_rip: true,
			artists: ['Kink'],
			remixer: ['Dusky'],
			featurings: [],
			type: 'Remix',
			genres: ['Deep House'],
			label: 'Anjunadeep',
			share_id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			requires_user_action: false,
			file: JSON.stringify(makeFileObject('songs', 'perth', 'perth_abgtrip', 'mp3'))
		},
		song3_library_user1: {
			id: CTypes.TimeUuid.fromDate(moment().subtract(1, 'hour').toDate()),
			title: 'Contact',
			suffix: null,
			year: 2019,
			bpm: 125,
			date_last_edit: new Date(),
			release_date: CTypes.LocalDate.fromDate(new Date('2019-03-02')),
			is_rip: false,
			artists: ['Rue', 'Alastor'],
			remixer: [],
			featurings: [],
			type: 'Original Mix',
			genres: ['Progressive House'],
			label: 'Anjunadeep',
			share_id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			requires_user_action: false,
			file: JSON.stringify(makeFileObject('songs', 'contact', 'contact_rue_alastor', 'mp3'))
		}
	}
}

export type DatabaseSeed = () => Promise<void>;

export const makeDatabaseSeed = (database: DatabaseConnection, songService: SongService): DatabaseSeed => async (): Promise<void> => {
	const insertUserQuery = (user: IUserDBResult) => {
		return database.execute(
			`INSERT INTO users (${Object.keys(user)}) VALUES (${Object.keys(user).map(() => '?').join(',')})`,
			Object.values(user)
		);
	}

	const insertShareByUserQuery = (shareByUser: IShareByUserDBResult) => {
		return database.execute(
			`INSERT INTO shares_by_user (${Object.keys(shareByUser)}) VALUES (${Object.keys(shareByUser).map(() => '?').join(',')})`,
			Object.values(shareByUser)
		)
	}

	// insert users for development and testing
	if (!__PROD__) {
		for (const user of Object.values(testData.users)) {
			await insertUserQuery(user);
		}
	}

	// insert shares for development and testing
	if (!__PROD__) {
		for (const shareByUser of Object.values(testData.shares)) {
			await insertShareByUserQuery(shareByUser);
		}
	}

	// insert songs for development
	if (!__PROD__) {
		for (const song of Object.values(testData.songs)) {
			await songService.create(song);
		}
	}

	if (false && __DEV__) {
		const prefilledArray = createPrefilledArray(100, {});
		const songInserts = prefilledArray
			.map((): Required<ISongByShareDBResult> => ({
				id: CTypes.TimeUuid.now(),
				title: faker.name.findName(),
				suffix: null,
				year: null,
				bpm: null,
				date_last_edit: new Date(),
				release_date: null,
				is_rip: false,
				artists: [faker.name.firstName(), faker.name.lastName()],
				remixer: [],
				featurings: [],
				type: 'Remix',
				genres: ['Some Genre'],
				label: null,
				share_id: testData.shares.library_user1.id,
				requires_user_action: false,
				file: JSON.stringify(makeFileObject('songs', faker.name.lastName(), faker.name.firstName(), 'mp3'))
			}));

		await Promise.all(songInserts.map(s => songService.create(s)));
	}
}