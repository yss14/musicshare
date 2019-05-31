import * as faker from 'faker';
import { createPrefilledArray } from '../utils/array/create-prefilled-array';
import { __PROD__, __DEV__, __TEST__ } from '../utils/env/env-constants';
import { makeFileObject } from '../models/interfaces/IFile';
import moment = require('moment');
import { v4 as uuid } from 'uuid';
import { UsersTable, IUserDBResult, IShareDBResult, ISongDBResult, IPlaylistDBResult } from './schema/tables';
import { IDatabaseClient } from 'postgres-schema-builder';
import { defaultSongTypes, defaultGenres } from './fixtures';
import { SongType } from '../models/SongType';
import { Genre } from '../models/GenreModel';
import { IServices } from '../services/services';
import { IConfig } from '../types/config';
import { Permissions } from '../auth/permissions';

type Users = 'user1' | 'user2';
type Shares = 'library_user1' | 'library_user2' | 'some_shared_library';
type Songs = 'song1_library_user1' | 'song2_library_user1' | 'song3_library_user1';
type Playlists = 'playlist1_library_user1' | 'playlist2_library_user1' | 'playlist_some_shared_library';

interface ITestDataSchema {
	users: { [P in Users]: Required<IUserDBResult>; };
	shares: { [P in Shares]: Required<IShareDBResult> & { user_ids: string[] } };
	songs: { [P in Songs]: Required<ISongDBResult> };
	playlists: { [P in Playlists]: Required<IPlaylistDBResult> & { songs: ISongDBResult[], share_id: string } };
}

export const testPassword = 'test1234';

const songZeroOliverSmith: ISongDBResult = {
	song_id: uuid(),
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
	file: makeFileObject('songs', 'zero', 'zero_somesuffic', 'mp3'),
	duration: 401,
	tags: ['Anjuna', 'Progressive'],
	date_added: moment().subtract(3, 'hours').toDate(),
	date_removed: null,
}

const songPerthDusky: ISongDBResult = {
	song_id: uuid(),
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
	file: makeFileObject('songs', 'perth', 'perth_abgtrip', 'mp3'),
	duration: 370,
	tags: ['Anjuna', 'Deep', 'Funky'],
	date_added: moment().subtract(2, 'hours').toDate(),
	date_removed: null,
}

const songContactAlastor: ISongDBResult = {
	song_id: uuid(),
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
	file: makeFileObject('songs', 'contact', 'contact_rue_alastor', 'mp3'),
	duration: 248,
	tags: ['Dark', 'Party Chill'],
	date_added: moment().subtract(1, 'hour').toDate(),
	date_removed: null,
}

const libraryUser1ShareID = uuid();
const libraryUser2ShareID = uuid();
const someShareShareID = uuid();
const user1ID = 'f0d8e1f0-aeb1-11e8-a117-43673ffd376b';
const user2ID = '3ba6fab4-f6ad-4916-9f1d-cdcfe522fd8e';

export const testData: ITestDataSchema = {
	users: {
		user1: {
			name: 'Yss',
			email: 'yannick.stachelscheid@musicshare.whatever',
			user_id: user1ID,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
		},
		user2: {
			name: 'Simon',
			email: faker.internet.email(),
			user_id: user2ID,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
		}
	},
	shares: {
		library_user1: {
			share_id: libraryUser1ShareID,
			name: 'Share Yss',
			is_library: true,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
			user_ids: [user1ID],

		},
		library_user2: {
			share_id: libraryUser2ShareID,
			name: 'Share Simon',
			is_library: true,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
			user_ids: [user2ID],
		},
		some_shared_library: {
			share_id: someShareShareID,
			name: 'Some Shared Library',
			is_library: false,
			date_added: moment().subtract(3, 'hours').toDate(),
			date_removed: null,
			user_ids: [user1ID, user2ID],
		}
	},
	songs: {
		song1_library_user1: songZeroOliverSmith,
		song2_library_user1: songPerthDusky,
		song3_library_user1: songContactAlastor,
	},
	playlists: {
		playlist1_library_user1: {
			playlist_id: uuid(),
			name: 'Playlist 1',
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor],
			date_added: moment().subtract(3, 'hours').toDate(),
			share_id: libraryUser1ShareID,
		},
		playlist2_library_user1: {
			playlist_id: uuid(),
			name: 'Playlist 2',
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor, songZeroOliverSmith, songPerthDusky, songContactAlastor],
			date_added: moment().subtract(3, 'hours').toDate(),
			share_id: libraryUser1ShareID,
		},
		playlist_some_shared_library: {
			playlist_id: uuid(),
			name: 'Some Shared Playlist 1',
			date_removed: null,
			songs: [songPerthDusky],
			date_added: moment().subtract(3, 'hours').toDate(),
			share_id: someShareShareID,
		}
	}
}

export type DatabaseSeed = () => Promise<void>;

interface IMakeDatabaseSeedArgs {
	database: IDatabaseClient;
	services: IServices;
}

export const makeDatabaseSeed = ({ database, services }: IMakeDatabaseSeedArgs): DatabaseSeed =>
	async (): Promise<void> => {
		const { songService, songTypeService, genreService, passwordLoginService, playlistService, shareService } = services;

		if (!__PROD__) {
			for (const user of Object.values(testData.users)) {
				await database.query(UsersTable.insertFromObj(user));

				await passwordLoginService.register({ userID: user.user_id.toString(), password: testPassword });
			}

			for (const shareByUser of Object.values(testData.shares)) {
				//await database.query(SharesTable.insertFromObj(shareByUser));
				await shareService.create(shareByUser.user_ids[0], shareByUser.name, shareByUser.is_library, shareByUser.share_id);

				for (const shareUserID of shareByUser.user_ids.slice(1)) {
					await shareService.addUser(shareByUser.share_id, shareUserID, Permissions.ALL);
				}

				await Promise.all(defaultSongTypes.map(songType =>
					songTypeService.addSongTypeToShare(shareByUser.share_id, SongType.fromObject(songType))));

				await Promise.all(defaultGenres.map(genre =>
					genreService.addGenreToShare(shareByUser.share_id, Genre.fromObject(genre))));
			}

			for (const song of Object.values(testData.songs)) {
				await songService.create(libraryUser1ShareID, song);
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
			const prefilledArray = createPrefilledArray(100, {});
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
					file: makeFileObject('songs', faker.name.lastName(), faker.name.firstName(), 'mp3'),
					duration: 120 + Math.floor(Math.random() * 400),
					tags: [],
					date_added: new Date(),
					date_removed: null,
				}));

			await Promise.all(songInserts.map(song => songService.create(libraryUser1ShareID, song)));
		}
	}

interface IInsertProductionSetupSeed {
	config: IConfig;
	services: IServices;
}

export const insertProductionSetupSeed = async ({ config, services, }: IInsertProductionSetupSeed) => {
	const { email, password, name: username, shareName } = config.setup.seed;

	const allUsers = await services.userService.getAll();

	if (allUsers.length > 0) return;

	const user = await services.userService.create(username, email);
	await services.passwordLoginService.register({ password, userID: user.id });

	await services.shareService.create(user.id, shareName, true);

	// istanbul ignore next
	if (!__TEST__) {
		console.info(`Created setup user with name ${username} and email ${email}`);
		console.info(`Created initial share ${shareName} with ${username} as owner`);
	}
}