import { IDatabaseClient } from "postgres-schema-builder";
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
import { ITagService, TagService } from "./TagService";
import { AWSS3FileService } from "../file-service/AWSS3FileService";
import { S3 } from "aws-sdk";
import { IFileService } from "../file-service/FileService";
import { ISeedService, SeedService } from "./SeedService";

export interface IServices {
	songFileService: IFileService;
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
	tagService: ITagService;
	seedService: ISeedService;
}

export interface IService {
	readonly services: IServices;
}

export type ServiceFactory = () => IServices;

export const initServices = (config: IConfig, database: IDatabaseClient): IServices => {
	let services: IServices = {} as any

	const serviceFactory = () => services

	const songFileService = initFileStore(config, 'songs');
	const songService = new SongService(database);
	const shareService = ShareService(database);
	const userService = new UserService(database, config);
	const songTypeService = new SongTypeService(database, shareService);
	const genreService = new GenreService(database, shareService);
	const artistService = new ArtistService(songService, shareService);
	const artistExtractor = new ArtistExtractor();
	const songMetaDataService = new SongMetaDataService([
		new ID3MetaData(artistExtractor),
		new MP3SongDuration()
	]);
	const playlistService = PlaylistService({ database, songService });
	const songProcessingQueue = new SongUploadProcessingQueue(
		songService,
		songFileService,
		songMetaDataService,
		songTypeService,
		playlistService,
		database
	);
	const authService = new AuthenticationService(config.jwt.secret);
	const passwordLoginService = PasswordLoginService({ authService, database, userService });
	const invalidAuthTokenStore = AuthTokenStore({ database, tokenGroup: 'authtoken' });
	const permissionService = PermissionService({ database });
	const tagService = TagService({ songService, shareService });
	const seedService = SeedService(database, serviceFactory)

	services = {
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
		tagService,
		seedService,
	}

	for (const service of Object.values(services)) {
		(service as any).services = services
	}

	return services
}

const initFileStore = (config: IConfig, container: string): IFileService => {
	const { provider, s3 } = config.fileStorage;

	if (provider === 'azureblob') {
		return new AzureFileService(container);
	} else if (provider === 'awss3') {
		if (!s3) {
			throw new Error(`AWS S3 is specified as file storage provider, but no credentials are provided`);
		}

		return new AWSS3FileService(new S3({
			accessKeyId: s3.accessKey,
			secretAccessKey: s3.secretKey,
			endpoint: s3.host,
			s3ForcePathStyle: true,
			signatureVersion: 'v4',
		}), container);
	} else {
		throw new Error(`Unknown file storage provider ${provider}`);
	}
}