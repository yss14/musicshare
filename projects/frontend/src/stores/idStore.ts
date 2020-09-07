import create from "zustand"

type IIDStore = {
	libraryID: string | null
	setLibraryID: (libraryID: string | null) => void

	shareID: string | null
	setShareID: (shareID: string | null) => void

	playlistID: string | null
	setplaylistID: (playlistID: string | null) => void
}

export const useIDStore = create<IIDStore>((set) => ({
	libraryID: null,
	setLibraryID: (libraryID) => set((state) => ({ ...state, libraryID })),

	shareID: null,
	setShareID: (shareID) => set((state) => ({ ...state, shareID })),

	playlistID: null,
	setplaylistID: (playlistID) => set((state) => ({ ...state, playlistID })),
}))
