import * as faker from 'faker';
import { createPrefilledArray } from '../utils/array/create-prefilled-array';
import { __PROD__, __DEV__, __TEST__ } from '../utils/env/env-constants';
import { makeFileObject } from '../models/interfaces/IFile';
import moment from "moment";
import { v4 as uuid } from 'uuid';
import { UsersTable, IUserDBResult, IShareDBResult, ISongDBResult, IPlaylistDBResult } from './tables';
import { IDatabaseClient } from 'postgres-schema-builder';
import { defaultSongTypes, defaultGenres } from './fixtures';
import { SongType } from '../models/SongType';
import { Genre } from '../models/GenreModel';
import { IServices } from '../services/services';
import { IConfig } from '../types/config';
import { Permissions } from '@musicshare/shared-types';
import { makeFileSourceJSONType } from '../models/FileSourceModels';

type Users = 'user1' | 'user2' | 'user3';
type Shares = 'library_user1' | 'library_user2' | 'some_share' | 'some_unrelated_library' | 'some_unrelated_share';
type Songs = 'song1_library_user1' | 'song2_library_user1' | 'song3_library_user1' | 'song4_library_user2' | 'song5_library_user3';
type Playlists = 'playlist1_library_user1' | 'playlist2_library_user1' | 'playlist_some_shared_library' | 'playlist_library_user2';

interface ITestDataSchema {
	users: { [P in Users]: Required<IUserDBResult>; };
	shares: { [P in Shares]: Required<IShareDBResult> & { user_ids: string[] } };
	songs: { [P in Songs]: Required<ISongDBResult> };
	playlists: { [P in Playlists]: Required<IPlaylistDBResult> & { songs: ISongDBResult[], share_id: string } };
}

export const testPassword = 'test1234';

const libraryUser1ShareID = 'de35f11a-a748-49cc-8da2-02ef12109ea5';
const libraryUser2ShareID = 'f02f540b-7db9-4655-b693-b89bb492a369';
const someShareShareID = 'f9d531d3-94f0-4876-af17-deda34194345';
const libraryUser3ShareID = '947266ea-b75f-4827-ba7e-2293d32e0c71';
const someUnrelatedShareID = 'afb266ea-b75f-4827-ba7e-2293d32e0c71';
const user1ID = 'f0d8e1f0-aeb1-11e8-a117-43673ffd376b';
const user2ID = '3ba6fab4-f6ad-4916-9f1d-cdcfe522fd8e';
const user3ID = 'f8e7ded2-65e2-4348-960d-8abc72146bf9';
const playlist1LibraryUser1ID = 'c3a21eb2-0cbd-4382-80b4-70925d6fd41d'
const playlist2LibraryUser1ID = '76ba6247-079f-4700-a711-92a504704213'
const playlistSomeSharedLibraryID = '8d6fa7cf-f416-408d-b964-d154e256a4cd'
const playlist1LibraryUser2ID = '7d25fbd2-aaac-4730-b5a3-2e77e4166607'

export const songZeroOliverSmith: ISongDBResult = {
	song_id: 'b5c143b5-0eb2-40d2-b098-8bd9a09a4492',
	title: 'Zero',
	suffix: null,
	year: 2018,
	bpm: null,
	date_last_edit: moment().subtract(3, 'hours').toDate(),
	release_date: new Date('2018-03-11'),
	is_rip: false,
	artists: ['Oliver Smith'],
	remixer: [],
	featurings: ['Natalie Holmes'],
	type: null,
	genres: ['Trance'],
	labels: null,
	requires_user_action: false,
	sources: makeFileSourceJSONType(makeFileObject('songs', 'zero', 'zero_somesuffic', 'mp3')),
	duration: 401,
	tags: ['Anjuna', 'Progressive'],
	date_added: moment().subtract(3, 'hours').toDate(),
	date_removed: null,
}

export const songPerthDusky: ISongDBResult = {
	song_id: '7adb2fdc-35fa-4490-9d43-5b1a178902d8',
	title: 'Perth',
	suffix: null,
	year: 2018,
	bpm: null,
	date_last_edit: moment().subtract(2, 'hours').toDate(),
	release_date: new Date('2019-01-02'),
	is_rip: true,
	artists: ['Kink'],
	remixer: ['Dusky'],
	featurings: [],
	type: 'Remix',
	genres: ['Deep House'],
	labels: ['Anjunadeep'],
	requires_user_action: false,
	sources: makeFileSourceJSONType(makeFileObject('songs', 'perth', 'perth_abgtrip', 'mp3')),
	duration: 370,
	tags: ['Anjuna', 'Deep', 'Funky'],
	date_added: moment().subtract(2, 'hours').toDate(),
	date_removed: null,
}

export const songContactAlastor: ISongDBResult = {
	song_id: 'a1cc61af-000e-49b2-86c6-6ff23060238b',
	title: 'Contact',
	suffix: null,
	year: 2019,
	bpm: 125,
	date_last_edit: moment().subtract(1, 'hour').toDate(),
	release_date: null,
	is_rip: false,
	artists: ['Rue', 'Alastor'],
	remixer: [],
	featurings: [],
	type: 'Original Mix',
	genres: ['Progressive House'],
	labels: ['Anjunadeep'],
	requires_user_action: false,
	sources: makeFileSourceJSONType(makeFileObject('songs', 'contact', 'contact_rue_alastor', 'mp3')),
	duration: 248,
	tags: ['Dark', 'Party Chill'],
	date_added: moment().subtract(1, 'hour').toDate(),
	date_removed: null,
}

export const songIsItLove: ISongDBResult = {
	song_id: 'c418f1c4-055c-4768-b834-67aaa03cc3d1',
	title: 'Is It Love',
	suffix: null,
	year: 2019,
	bpm: 128,
	date_last_edit: moment().subtract(24, 'hour').toDate(),
	release_date: null,
	is_rip: false,
	artists: ['Above & Beyond'],
	remixer: ['Gabriel & Dresden'],
	featurings: [],
	type: 'Remix',
	genres: ['Trance'],
	labels: ['Anjunabeats'],
	requires_user_action: false,
	sources: makeFileSourceJSONType(makeFileObject('songs', 'isitlove', 'is_it_love_beatport', 'mp3')),
	duration: 357,
	tags: [],
	date_added: moment().subtract(48, 'hour').toDate(),
	date_removed: null,
}

export const songThunder: ISongDBResult = {
	song_id: 'fb7c77e1-71c9-43b0-8fb5-4a8a4b112a69',
	title: 'Thunder',
	suffix: null,
	year: 2016,
	bpm: 109,
	date_last_edit: moment().subtract(13, 'hour').toDate(),
	release_date: null,
	is_rip: false,
	artists: ['Imagine Dragons'],
	remixer: [],
	featurings: [],
	type: 'Radio Edit',
	genres: ['Indie Rock'],
	labels: [],
	requires_user_action: false,
	sources: makeFileSourceJSONType(
		makeFileObject('songs', 'thunder_imaginedragins', 'thunder_imaginedragins_yt_downloader', 'mp3')
	),
	duration: 234,
	tags: ['Good Mood'],
	date_added: moment().subtract(14, 'hour').toDate(),
	date_removed: null,
}

export const testData: ITestDataSchema = {
	users: {
		user1: {
			name: 'Yss',
			email: 'test@musicshare.rocks',
			user_id: user1ID,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
			invitation_token: null,
		},
		user2: {
			name: 'Simon',
			email: 'simon@musicshare.rocks',
			user_id: user2ID,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
			invitation_token: null,
		},
		user3: {
			name: 'Mariana',
			email: faker.internet.email(),
			user_id: user3ID,
			date_added: moment().subtract(1, 'hours').toDate(),
			date_removed: null,
			invitation_token: null,
		},
	},
	shares: {
		library_user1: {
			share_id: libraryUser1ShareID,
			name: 'Library Yss',
			is_library: true,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
			user_ids: [user1ID],
		},
		library_user2: {
			share_id: libraryUser2ShareID,
			name: 'Share Simon',
			is_library: true,
			date_added: moment().subtract(2, 'hours').toDate(),
			date_removed: null,
			user_ids: [user2ID],
		},
		some_share: {
			share_id: someShareShareID,
			name: 'Some Share',
			is_library: false,
			date_added: moment().subtract(1, 'hours').toDate(),
			date_removed: null,
			user_ids: [user1ID, user2ID],
		},
		some_unrelated_library: {
			share_id: libraryUser3ShareID,
			name: 'Some Unrelated Library',
			is_library: true,
			date_added: moment().subtract(1, 'hours').toDate(),
			date_removed: null,
			user_ids: [user3ID],
		},
		some_unrelated_share: {
			share_id: someUnrelatedShareID,
			name: 'Some Unrelated Share',
			is_library: false,
			date_added: moment().subtract(30, 'minutes').toDate(),
			date_removed: null,
			user_ids: [user3ID],
		}
	},
	songs: {
		song1_library_user1: songZeroOliverSmith,
		song2_library_user1: songPerthDusky,
		song3_library_user1: songContactAlastor,
		song4_library_user2: songIsItLove,
		song5_library_user3: songThunder,
	},
	playlists: {
		playlist1_library_user1: {
			playlist_id: playlist1LibraryUser1ID,
			name: 'Playlist 1',
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor],
			date_added: moment().subtract(3, 'hours').toDate(),
			share_id: libraryUser1ShareID,
		},
		playlist2_library_user1: {
			playlist_id: playlist2LibraryUser1ID,
			name: 'Playlist 2',
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor, songZeroOliverSmith, songPerthDusky, songContactAlastor],
			date_added: moment().subtract(3, 'hours').toDate(),
			share_id: libraryUser1ShareID,
		},
		playlist_some_shared_library: {
			playlist_id: playlistSomeSharedLibraryID,
			name: 'Some Shared Playlist 1',
			date_removed: null,
			songs: [songPerthDusky],
			date_added: moment().subtract(3, 'hours').toDate(),
			share_id: someShareShareID,
		},
		playlist_library_user2: {
			playlist_id: playlist1LibraryUser2ID,
			name: 'Playlist1 of Simon',
			date_removed: null,
			songs: [songPerthDusky],
			date_added: moment().subtract(3, 'hours').toDate(),
			share_id: libraryUser2ShareID,
		}
	}
}

export const createTestSongs = (amount: number) => {
	const prefilledArray = createPrefilledArray(amount, {});
	const songInserts = prefilledArray
		.map((_, idx): Required<ISongDBResult> => ({
			song_id: uuid(),
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
			labels: null,
			requires_user_action: false,
			sources: makeFileSourceJSONType(
				makeFileObject('songs', faker.name.lastName(), faker.name.firstName(), 'mp3')
			),
			duration: 120 + Math.floor(Math.random() * 400),
			tags: [],
			date_added: new Date(),
			date_removed: null,
		}));

	return songInserts
}

interface IMakeDatabaseSeedArgs {
	database: IDatabaseClient;
	services: IServices;
}

export const seedDatabase = async ({ database, services }: IMakeDatabaseSeedArgs) => {
	const { songService, songTypeService, genreService, passwordLoginService, playlistService, shareService } = services;

	if (!__PROD__) {
		for (const user of Object.values(testData.users)) {
			await database.query(UsersTable.insertFromObj(user));

			await passwordLoginService.register({ userID: user.user_id.toString(), password: testPassword });
		}

		for (const shareByUser of Object.values(testData.shares)) {
			await shareService.create(shareByUser.user_ids[0], shareByUser.name, shareByUser.is_library, shareByUser.share_id);

			for (const shareUserID of shareByUser.user_ids.slice(1)) {
				let permissions = Permissions.ALL;

				if (shareByUser.share_id === someShareShareID && shareUserID === user2ID) {
					permissions = Permissions.NEW_MEMBER;
				}

				await shareService.addUser(shareByUser.share_id, shareUserID, permissions);
			}

			await Promise.all(defaultSongTypes.map(songType =>
				songTypeService.addSongTypeToShare(shareByUser.share_id, SongType.fromObject(songType))));

			await Promise.all(defaultGenres.map(genre =>
				genreService.addGenreToShare(shareByUser.share_id, Genre.fromObject(genre))));
		}

		for (const [key, song] of Object.entries(testData.songs)) {
			if (key.indexOf('user1') > -1) {
				await songService.create(libraryUser1ShareID, song);
			} else if (key.indexOf('user2') > -1) {
				await songService.create(libraryUser2ShareID, song);
			} else if (key.indexOf('user3') > -1) {
				await songService.create(libraryUser3ShareID, song);
			}
		}

		for (const playlist of Object.values(testData.playlists)) {
			await playlistService.create(playlist.share_id, playlist.name, playlist.playlist_id.toString());

			await playlistService.addSongs(
				playlist.share_id,
				playlist.playlist_id,
				playlist.songs.map(song => song.song_id.toString())
			);
		}
	}

	if (__DEV__) {
		const songInserts = createTestSongs(100)

		for (const songInsert of songInserts) {
			await songService.create(libraryUser1ShareID, songInsert)
		}

		await Promise.all(
			createPrefilledArray(50, {}).map((_, idx): IPlaylistDBResult => ({
				name: `Playlist ${idx}`,
				playlist_id: uuid(),
				date_added: new Date(),
				date_removed: null,
			}))
				.map(playlist => playlistService.create(libraryUser1ShareID, playlist.name, playlist.playlist_id))
		)
	}
}

interface IInsertProductionSetupSeed {
	config: IConfig;
	services: IServices;
}

export const insertProductionSetupSeed = async ({ config, services, }: IInsertProductionSetupSeed) => {
	const { email, password, name: username, shareName } = config.setup.seed;
	const { userService, passwordLoginService, seedService, shareService } = services

	const allUsers = await userService.getAll();

	if (allUsers.length > 0) return false;

	const user = await userService.create(username, email);
	await passwordLoginService.register({ password, userID: user.id });

	const initialShare = await shareService.create(user.id, shareName, true);
	await seedService.seedShare(initialShare.id)

	// istanbul ignore next
	if (!__TEST__) {
		console.info(`Created setup user with name ${username} and email ${email}`);
		console.info(`Created initial share ${shareName} with ${username} as owner`);
	}

	return true
}