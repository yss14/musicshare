import { ISongTypeService } from "../../services/SongTypeService"
import { defaultSongTypes } from "../../database/fixtures"
import { SongType } from "../../models/SongType"
import { v4 as uuid } from "uuid"

export const SongTypeServiceMock = (): ISongTypeService => ({
	getSongTypeForShare: jest.fn(),
	getSongTypesForShare: async () =>
		defaultSongTypes.map((songType) => SongType.fromObject({ id: uuid(), ...songType })),
	getSongTypesForShares: async () =>
		defaultSongTypes.map((songType) => SongType.fromObject({ id: uuid(), ...songType })),
	getAggregatedSongTypesForUser: async () =>
		defaultSongTypes.map((songType) => SongType.fromObject({ id: uuid(), ...songType })),
	addSongTypeToShare: jest.fn(),
	updateSongTypeOfShare: jest.fn(),
	removeSongTypeFromShare: jest.fn(),
})
