import { SongService } from '../services/SongService';
import { DatabaseConnection } from "./DatabaseConnection";
import * as faker from 'faker';
import { types as CTypes } from 'cassandra-driver';
import { IUserDBResult, IShareByUserDBResult, ISongByShareDBResult } from './schema/initial-schema';
import { createPrefilledArray } from '../utils/array/create-prefilled-array';
import { __PROD__ } from '../utils/env/env-constants';
import { IFile } from '../models/interfaces/IFile';

type Users = 'user1';
type Shares = 'library_user1';
type Songs = 'song1_library_user1' | 'song2_library_user1';

interface ITestDataSchema {
	users: { [P in Users]: Required<IUserDBResult>; };
	shares: { [P in Shares]: Required<IShareByUserDBResult> };
	songs: { [P in Songs]: Required<ISongByShareDBResult> };
}

const generatedEMails = (numbersOfEMails: number): string[] => {
	const prefilledArray = createPrefilledArray(numbersOfEMails, '');

	return prefilledArray
		.map(() => faker.internet.email());
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
			artists: ['Oliver Smith'],
			remixer: [],
			featurings: ['Natalie Holmes'],
			type: null,
			genres: ['Trance'],
			label: null,
			share_id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			needs_user_action: false,
			file: JSON.stringify({ container: 'songs', blob: 'somefile', fileExtension: 'mp3' } as IFile)
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
			type: 'Remix',
			genres: ['Deep House'],
			label: 'Anjunadeep',
			share_id: CTypes.TimeUuid.fromString('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			needs_user_action: false,
			file: JSON.stringify({ container: 'songs', blob: 'somefile', fileExtension: 'mp3' } as IFile)
		}
	}
}

export type DatabaseSeed = () => Promise<void>;

export const makeDatabaseSeed = (database: DatabaseConnection, songService: SongService): DatabaseSeed => async (): Promise<void> => {
	// insert users for development and testing
	if (!__PROD__) {
		await database.execute(`
			INSERT INTO users (id, name, emails) VALUES (?, ?, ?)`,
			[testData.users.user1.id, testData.users.user1.name, testData.users.user1.emails]
		);
	}

	// insert shares for development and testing
	if (!__PROD__) {
		await database.execute(`
			INSERT INTO shares_by_user (id, name, user_id, is_library) VALUES (?, ?, ?, ?)`,
			[testData.shares.library_user1.id, testData.shares.library_user1.name,
			testData.shares.library_user1.user_id, testData.shares.library_user1.is_library]
		);
	}

	// insert songs for development and testing
	if (!__PROD__) {
		for (const song of Object.values(testData.songs)) {

			await songService.create(song);
		}

		const prefilledArray = createPrefilledArray(100, {});
		const songInserts = prefilledArray
			.map((): Required<ISongByShareDBResult> => ({
				id: CTypes.TimeUuid.now(),
				title: faker.name.findName(),
				suffix: null,
				year: null,
				bpm: null,
				date_last_edit: Date.now(),
				release_date: null,
				is_rip: false,
				artists: [faker.name.firstName(), faker.name.lastName()],
				remixer: [],
				featurings: [],
				type: 'Remix',
				genres: ['Some Genre'],
				label: null,
				share_id: testData.shares.library_user1.id,
				needs_user_action: false,
				file: '{}'
			}));

		await Promise.all(songInserts.map(s => songService.create(s)));
	}
}