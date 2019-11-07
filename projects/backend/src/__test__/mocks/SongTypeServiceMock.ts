import { ISongTypeService } from "../../services/SongTypeService";
import { defaultSongTypes } from "../../database/fixtures";
import { SongType } from "../../models/SongType";

export const SongTypeServiceMock = (): ISongTypeService => ({
	getSongTypesForShare: async () => defaultSongTypes.map(SongType.fromObject),
	getSongTypesForShares: async () => defaultSongTypes.map(SongType.fromObject),
	getAggregatedSongTypesForUser: async () => defaultSongTypes.map(SongType.fromObject),
	addSongTypeToShare: jest.fn(),
	removeSongTypeFromShare: jest.fn()
});