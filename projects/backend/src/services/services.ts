import { IDatabaseClient } from "cassandra-schema-builder";
import { AzureFileService } from "../file-service/AzureFileService";
import { ISongService, SongService } from "./SongService";
import { IShareService, ShareService } from "./ShareService";
import { IUserService, UserService } from "./UserService";
import { ISongTypeService, SongTypeService } from "./SongTypeService";
import { IGenreService, GenreService } from "./GenreService";
import { IArtistService, ArtistService } from "./ArtistService";
import { ArtistExtractor } from "../utils/song-meta/song-meta-formats/id3/ArtistExtractor";
import { ISongMetaDataService, SongMetaDataService } from "../utils/song-meta/SongMetaDataService";
import { ISongUploadProcessingQueue, SongUploadProcessingQueue } from "../job-queues/SongUploadProcessingQueue";
import { IAuthenticationService, AuthenticationService } from "../auth/AuthenticationService";
import { IPasswordLoginService, PasswordLoginService } from "../auth/PasswordLoginService";
import { IPlaylistService, PlaylistService } from "./PlaylistService";
import { IAuthTokenStore, AuthTokenStore } from "../auth/AuthTokenStore";
import { IPermissionService, PermissionService } from "./PermissionsService";
import { ID3MetaData } from "../utils/song-meta/song-meta-formats/id3/ID3MetaData";
import { MP3SongDuration } from "../utils/song-meta/song-meta-formats/id3/MP3SongDuration";
import { IConfig } from "../types/config";

export interface IServices {
	songFileService: AzureFileService;
	songService: ISongService;
	shareService: IShareService;
	userService: IUserService;
	songTypeService: ISongTypeService;
	genreService: IGenreService;
	artistService: IArtistService;
	artistExtractor: ArtistExtractor;
	songMetaDataService: ISongMetaDataService;
	songProcessingQueue: ISongUploadProcessingQueue;
	authService: IAuthenticationService;
	passwordLoginService: IPasswordLoginService;
	playlistService: IPlaylistService;
	invalidAuthTokenStore: IAuthTokenStore;
	permissionService: IPermissionService;
}

export const initServices = (config: IConfig, database: IDatabaseClient): IServices => {
	const songFileService = new AzureFileService('songs');
	const songService = new SongService(database);
	const shareService = new ShareService(database);
	const userService = new UserService(database);
	const songTypeService = new SongTypeService(database);
	const genreService = new GenreService(database);
	const artistService = new ArtistService(songService);
	const artistExtractor = new ArtistExtractor();
	const songMetaDataService = new SongMetaDataService([
		new ID3MetaData(artistExtractor),
		new MP3SongDuration()
	]);
	const songProcessingQueue = new SongUploadProcessingQueue(songService, songFileService, songMetaDataService, songTypeService);
	const authService = new AuthenticationService(config.jwt.secret);
	const passwordLoginService = PasswordLoginService({ authService, database, userService });
	const playlistService = PlaylistService({ database, songService });
	const invalidAuthTokenStore = AuthTokenStore({ database, tokenGroup: 'authtoken' });
	const permissionService = PermissionService({ database });

	return {
		songFileService,
		songService,
		shareService,
		userService,
		songTypeService,
		genreService,
		artistService,
		artistExtractor,
		songMetaDataService,
		songProcessingQueue,
		authService,
		passwordLoginService,
		playlistService,
		invalidAuthTokenStore,
		permissionService,
	};
}