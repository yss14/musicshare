import * as faker from 'faker';
import { createPrefilledArray } from '../utils/array/create-prefilled-array';
import { __PROD__, __DEV__, __TEST__ } from '../utils/env/env-constants';
import { makeFileObject } from '../models/interfaces/IFile';
import moment = require('moment');
import { TimeUUID } from '../types/TimeUUID';
import { types as CTypes } from 'cassandra-driver';
import { IUsersDBResult, IShareByUserDBResult, ISongByShareDBResult, UsersTable, SharesByUserTable, IPlaylistByShareDBResult } from './schema/tables';
import { IDatabaseClient } from 'cassandra-schema-builder';
import { defaultSongTypes, defaultGenres } from './fixtures';
import { SongType } from '../models/SongType';
import { Genre } from '../models/GenreModel';
import { Permissions } from '../auth/permissions';
import { IServices } from '../services/services';
import { IConfig } from '../types/config';

type Users = 'user1' | 'user2';
type Shares = 'library_user1' | 'library_user2' | 'some_shared_library';
type Songs = 'song1_library_user1' | 'song2_library_user1' | 'song3_library_user1' | 'song1_some_shared_library';
type Playlists = 'playlist1_library_user1' | 'playlist2_library_user1' | 'playlist_some_shared_library';

interface ITestDataSchema {
	users: { [P in Users]: Required<IUsersDBResult>; };
	shares: { [P in Shares]: Required<IShareByUserDBResult> };
	songs: { [P in Songs]: Required<ISongByShareDBResult> };
	playlists: { [P in Playlists]: Required<IPlaylistByShareDBResult> & { songs: ISongByShareDBResult[] } };
}

export const testPassword = 'test1234';

const songZeroOliverSmith: ISongByShareDBResult = {
	song_id: TimeUUID(moment().subtract(3, 'hours').toDate()),
	title: 'Zero',
	suffix: null,
	year: 2018,
	bpm: null,
	date_last_edit: moment().subtract(3, 'hours').toDate(),
	release_date: CTypes.LocalDate.fromDate(new Date('2018-03-11')),
	is_rip: false,
	artists: ['Oliver Smith'],
	remixer: [],
	featurings: ['Natalie Holmes'],
	type: null,
	genres: ['Trance'],
	labels: null,
	share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
	requires_user_action: false,
	file: JSON.stringify(makeFileObject('songs', 'zero', 'zero_somesuffic', 'mp3')),
	duration: 401,
	tags: ['Anjuna', 'Progressive'],
}

const songPerthDusky: ISongByShareDBResult = {
	song_id: TimeUUID(moment().subtract(2, 'hours').toDate()),
	title: 'Perth',
	suffix: null,
	year: 2018,
	bpm: null,
	date_last_edit: moment().subtract(2, 'hours').toDate(),
	release_date: CTypes.LocalDate.fromDate(new Date('2019-01-02')),
	is_rip: true,
	artists: ['Kink'],
	remixer: ['Dusky'],
	featurings: [],
	type: 'Remix',
	genres: ['Deep House'],
	labels: ['Anjunadeep'],
	share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
	requires_user_action: false,
	file: JSON.stringify(makeFileObject('songs', 'perth', 'perth_abgtrip', 'mp3')),
	duration: 370,
	tags: ['Anjuna', 'Deep', 'Funky'],
}

const songContactAlastor: ISongByShareDBResult = {
	song_id: TimeUUID(moment().subtract(1, 'hour').toDate()),
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
	share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
	requires_user_action: false,
	file: JSON.stringify(makeFileObject('songs', 'contact', 'contact_rue_alastor', 'mp3')),
	duration: 248,
	tags: ['Dark', 'Party Chill'],
}

export const testData: ITestDataSchema = {
	users: {
		user1: {
			name: 'Yss',
			email: 'yannick.stachelscheid@musicshare.whatever',
			user_id: TimeUUID('f0d8e1f0-aeb1-11e8-a117-43673ffd376b')
		},
		user2: {
			name: 'Simon',
			email: faker.internet.email(),
			user_id: TimeUUID('f0d8e1f1-aeb1-11e8-a117-43673ffd376b')
		}
	},
	shares: {
		library_user1: {
			share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Share Yss',
			user_id: TimeUUID('f0d8e1f0-aeb1-11e8-a117-43673ffd376b'),
			is_library: true,
			permissions: Permissions.ALL,
		},
		library_user2: {
			share_id: TimeUUID('f0d659e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Share Simon',
			user_id: TimeUUID('f0d8e1f1-aeb1-11e8-a117-43673ffd376b'),
			is_library: true,
			permissions: Permissions.ALL,
		},
		some_shared_library: {
			share_id: TimeUUID('f0d359e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Some Shared Library',
			user_id: TimeUUID('f0d8e1f0-aeb1-11e8-a117-43673ffd376b'),
			is_library: false,
			permissions: Permissions.ALL,
		}
	},
	songs: {
		song1_library_user1: songZeroOliverSmith,
		song2_library_user1: songPerthDusky,
		song3_library_user1: songContactAlastor,
		song1_some_shared_library: {
			...songContactAlastor,
			share_id: TimeUUID('f0d359e0-aeb1-11e8-a117-43673ffd376b'),
			remixer: ['Marsh'],
			type: 'Remix',
		}
	},
	playlists: {
		playlist1_library_user1: {
			playlist_id: TimeUUID(moment().subtract(1, 'hours').toDate()),
			name: 'Playlist 1',
			share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor],
		},
		playlist2_library_user1: {
			playlist_id: TimeUUID(moment().subtract(1, 'day').toDate()),
			name: 'Playlist 2',
			share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor, songZeroOliverSmith, songPerthDusky, songContactAlastor],
		},
		playlist_some_shared_library: {
			playlist_id: TimeUUID(moment().subtract(1, 'hours').toDate()),
			name: 'Some Shared Playlist 1',
			share_id: TimeUUID('f0d359e0-aeb1-11e8-a117-43673ffd376b'),
			date_removed: null,
			songs: [songPerthDusky]
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
		const { songService, songTypeService, genreService, passwordLoginService, playlistService } = services;

		if (!__PROD__) {
			for (const user of Object.values(testData.users)) {
				await database.query(UsersTable.insertFromObj(user));

				await passwordLoginService.register({ userID: user.user_id.toString(), email: user.email, password: testPassword });
			}

			for (const shareByUser of Object.values(testData.shares)) {
				await database.query(SharesByUserTable.insertFromObj(shareByUser));

				await Promise.all(defaultSongTypes.map(songType =>
					songTypeService.addSongTypeToShare(shareByUser.share_id.toString(), SongType.fromObject(songType))));

				await Promise.all(defaultGenres.map(genre =>
					genreService.addGenreToShare(shareByUser.share_id.toString(), Genre.fromObject(genre))));
			}

			for (const song of Object.values(testData.songs)) {
				await songService.create(song);
			}

			for (const playlist of Object.values(testData.playlists)) {
				await playlistService.create(playlist.share_id.toString(), playlist.name, playlist.playlist_id.toString());

				await playlistService.addSongs(
					playlist.share_id.toString(),
					playlist.playlist_id.toString(),
					playlist.songs.map(song => song.song_id.toString())
				);
			}
		}

		if (__DEV__) {
			const prefilledArray = createPrefilledArray(100, {});
			const songInserts = prefilledArray
				.map((_, idx): Required<ISongByShareDBResult> => ({
					song_id: TimeUUID(),
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
					share_id: testData.shares.library_user1.share_id,
					requires_user_action: false,
					file: JSON.stringify(makeFileObject('songs', faker.name.lastName(), faker.name.firstName(), 'mp3')),
					duration: 120 + Math.floor(Math.random() * 400),
					tags: [],
				}));

			await Promise.all(songInserts.map(s => songService.create(s)));
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
	await services.passwordLoginService.register({ email, password, userID: user.id });

	await services.shareService.create(user.id, shareName);

	// istanbul ignore next
	if (!__TEST__) {
		console.info(`Created setup user with name ${username} and email ${email}`);
		console.info(`Created initial share ${shareName} with ${username} as owner`);
	}
}