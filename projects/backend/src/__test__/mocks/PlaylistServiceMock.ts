import { IPlaylistService } from "../../services/PlaylistService";

export const PlaylistServiceMock = (): IPlaylistService => ({
	addSongs: jest.fn(),
	create: jest.fn(),
	delete: jest.fn(),
	getByID: jest.fn(),
	getPlaylistsForShare: jest.fn(),
	getSongs: jest.fn(),
	removeSongs: jest.fn(),
	removeSongByID: jest.fn(),
	rename: jest.fn(),
	updateOrder: jest.fn(),
})