import { useArtists, useGenres, useTags, useSongTypes, useSong } from "@musicshare/react-graphql-client"
import { SongForm } from "./SongForm"
import { ShareSong } from "@musicshare/shared-types"
import { useLibraryID } from "../../../hooks/data/useLibraryID"

interface ISongModalProps {
	song: ShareSong
	playlistID?: string
	closeForm: () => void
}

export const SongModal = ({ song, closeForm, playlistID }: ISongModalProps) => {
	const { isFetching: loadingSong, error: errorSong, data: songFromAPI } = useSong(song.shareID, song.id)
	const { isFetching: loadingGenres, error: errorGenres, data: genres } = useGenres()
	const { isFetching: loadingArtists, error: errorArtists, data: artists } = useArtists()
	const { isFetching: loadingTags, error: errorTags, data: tags } = useTags()
	const { isFetching: loadingSongTypes, error: errorSongTypes, data: songTypes } = useSongTypes()
	const userLibraryID = useLibraryID()

	if (loadingSong || loadingGenres || loadingSongTypes || loadingArtists || loadingTags) {
		return <div>Loading</div>
	}
	if (errorSong || errorGenres || errorSongTypes || errorArtists || errorTags) {
		closeForm()

		return null
	}
	if (songFromAPI && genres && songTypes && artists && tags) {
		return (
			<SongForm
				song={songFromAPI}
				genres={genres}
				songTypes={songTypes}
				artists={artists}
				closeForm={closeForm}
				tags={tags}
				playlistID={playlistID}
				readOnly={!userLibraryID || song.libraryID !== userLibraryID}
			/>
		)
	} else {
		console.error("Some data is invalid", { songFromAPI, genres, songTypes, artists, tags })

		closeForm()

		return null
	}
}
