import { SongService } from '../services/SongService';
import * as faker from 'faker';
import { createPrefilledArray } from '../utils/array/create-prefilled-array';
import { __PROD__, __DEV__ } from '../utils/env/env-constants';
import { makeFileObject } from '../models/interfaces/IFile';
import moment = require('moment');
import { TimeUUID } from '../types/TimeUUID';
import { types as CTypes } from 'cassandra-driver';
import { IUsersDBResult, IShareByUserDBResult, ISongByShareDBResult, UsersTable, SharesByUserTable, IPlaylistByShareDBResult } from './schema/tables';
import { IDatabaseClient } from 'cassandra-schema-builder';
import { defaultSongTypes, defaultGenres } from './fixtures';
import { ISongTypeService } from '../services/SongTypeService';
import { SongType } from '../models/SongType';
import { IGenreService } from '../services/GenreService';
import { Genre } from '../models/GenreModel';
import { IPasswordLoginService } from '../auth/PasswordLoginService';
import { IPlaylistService } from '../services/PlaylistService';
import { Song } from '../models/SongModel';

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
	id: TimeUUID(moment().subtract(3, 'hours').toDate()),
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
	label: null,
	share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
	requires_user_action: false,
	file: JSON.stringify(makeFileObject('songs', 'zero', 'zero_somesuffic', 'mp3')),
	duration: 401,
}

const songPerthDusky: ISongByShareDBResult = {
	id: TimeUUID(moment().subtract(2, 'hours').toDate()),
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
	label: 'Anjunadeep',
	share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
	requires_user_action: false,
	file: JSON.stringify(makeFileObject('songs', 'perth', 'perth_abgtrip', 'mp3')),
	duration: 370,
}

const songContactAlastor: ISongByShareDBResult = {
	id: TimeUUID(moment().subtract(1, 'hour').toDate()),
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
	label: 'Anjunadeep',
	share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
	requires_user_action: false,
	file: JSON.stringify(makeFileObject('songs', 'contact', 'contact_rue_alastor', 'mp3')),
	duration: 248,
}

export const testData: ITestDataSchema = {
	users: {
		user1: {
			name: 'Yss',
			email: 'yannick.stachelscheid@musicshare.whatever',
			id: TimeUUID('f0d8e1f0-aeb1-11e8-a117-43673ffd376b')
		},
		user2: {
			name: 'Simon',
			email: faker.internet.email(),
			id: TimeUUID('f0d8e1f1-aeb1-11e8-a117-43673ffd376b')
		}
	},
	shares: {
		library_user1: {
			id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Share Yss',
			user_id: TimeUUID('f0d8e1f0-aeb1-11e8-a117-43673ffd376b'),
			is_library: true
		},
		library_user2: {
			id: TimeUUID('f0d659e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Share Simon',
			user_id: TimeUUID('f0d8e1f1-aeb1-11e8-a117-43673ffd376b'),
			is_library: true
		},
		some_shared_library: {
			id: TimeUUID('f0d359e0-aeb1-11e8-a117-43673ffd376b'),
			name: 'Some Shared Library',
			user_id: TimeUUID('f0d8e1f0-aeb1-11e8-a117-43673ffd376b'),
			is_library: false
		}
	},
	songs: {
		song1_library_user1: songZeroOliverSmith,
		song2_library_user1: songPerthDusky,
		song3_library_user1: songContactAlastor,
		song1_some_shared_library: {
			...songContactAlastor,
			share_id: TimeUUID('f0d359e0-aeb1-11e8-a117-43673ffd376b'),
		}
	},
	playlists: {
		playlist1_library_user1: {
			id: TimeUUID(moment().subtract(1, 'hours').toDate()),
			name: 'Playlist 1',
			share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor],
		},
		playlist2_library_user1: {
			id: TimeUUID(moment().subtract(1, 'day').toDate()),
			name: 'Playlist 2',
			share_id: TimeUUID('f0d649e0-aeb1-11e8-a117-43673ffd376b'),
			date_removed: null,
			songs: [songZeroOliverSmith, songPerthDusky, songContactAlastor, songZeroOliverSmith, songPerthDusky, songContactAlastor],
		},
		playlist_some_shared_library: {
			id: TimeUUID(moment().subtract(1, 'hours').toDate()),
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
	songService: SongService;
	songTypeService: ISongTypeService;
	genreService: IGenreService;
	passwordLoginService: IPasswordLoginService;
	playlistService: IPlaylistService;
}

export const makeDatabaseSeed = ({ database, songService, songTypeService, genreService, passwordLoginService, playlistService }: IMakeDatabaseSeedArgs): DatabaseSeed =>
	async (): Promise<void> => {

		if (!__PROD__) {
			for (const user of Object.values(testData.users)) {
				await database.query(UsersTable.insertFromObj(user));

				await passwordLoginService.register({ userID: user.id.toString(), email: user.email, password: testPassword });
			}

			for (const shareByUser of Object.values(testData.shares)) {
				await database.query(SharesByUserTable.insertFromObj(shareByUser));

				await Promise.all(defaultSongTypes.map(songType =>
					songTypeService.addSongTypeToShare(shareByUser.id.toString(), SongType.fromObject(songType))));

				await Promise.all(defaultGenres.map(genre =>
					genreService.addGenreToShare(shareByUser.id.toString(), Genre.fromObject(genre))));
			}

			for (const song of Object.values(testData.songs)) {
				await songService.create(song);
			}

			for (const playlist of Object.values(testData.playlists)) {
				await playlistService.create(playlist.share_id.toString(), playlist.name, playlist.id.toString());

				await playlistService.addSongs(playlist.id.toString(), playlist.songs.map(Song.fromDBResult));
			}
		}

		if (__DEV__) {
			const prefilledArray = createPrefilledArray(100, {});
			const songInserts = prefilledArray
				.map((_, idx): Required<ISongByShareDBResult> => ({
					id: TimeUUID(),
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
					file: JSON.stringify(makeFileObject('songs', faker.name.lastName(), faker.name.firstName(), 'mp3')),
					duration: 120 + Math.floor(Math.random() * 400),
				}));

			await Promise.all(songInserts.map(s => songService.create(s)));
		}
	}